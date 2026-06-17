'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react'

// Proprietary in-app video room (#4). Direct peer-to-peer WebRTC; the Next.js
// route at /api/webrtc/[roomId] is used only to exchange connection details
// (offer/answer/ICE) via short-polling. Public STUN now; a TURN server is added
// before launch for patients behind strict NATs.
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // TODO(launch): add a TURN server (urls/username/credential) for ~10–15% of
  // networks where STUN alone can't traverse the NAT.
]

const POLL_MS = 1000

type Phase = 'idle' | 'connecting' | 'waiting' | 'connected' | 'ended' | 'error'

export function CallRoom({
  roomId,
  expert,
  expertRole,
  patientName,
}: {
  roomId: string
  expert: string
  expertRole: string
  patientName: string
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerIdRef = useRef<string>('')
  const otherPeerRef = useRef<string | null>(null)
  const politeRef = useRef<boolean>(false)
  const makingOfferRef = useRef<boolean>(false)
  const ignoreOfferRef = useRef<boolean>(false)
  const sinceRef = useRef<number>(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tracksAddedRef = useRef<boolean>(false)
  const stoppedRef = useRef<boolean>(false)

  const send = useCallback(
    async (kind: string, data: unknown) => {
      try {
        await fetch(`/api/webrtc/${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peerId: peerIdRef.current, kind, data }),
        })
      } catch {
        /* a dropped signal will be retried by the next negotiation tick */
      }
    },
    [roomId]
  )

  const buildPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) void send('ice', candidate)
    }
    pc.ontrack = ({ streams }) => {
      if (remoteVideoRef.current && streams[0]) {
        remoteVideoRef.current.srcObject = streams[0]
        setPhase('connected')
      }
    }
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true
        await pc.setLocalDescription()
        await send('offer', pc.localDescription)
      } catch {
        /* negotiation will retry */
      } finally {
        makingOfferRef.current = false
      }
    }
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        if (!stoppedRef.current) setPhase('waiting')
      }
    }
    return pc
  }, [send])

  // Add local tracks once we know there's a peer to negotiate with.
  const startNegotiation = useCallback(() => {
    if (tracksAddedRef.current || !pcRef.current || !localStreamRef.current) return
    tracksAddedRef.current = true
    for (const track of localStreamRef.current.getTracks()) {
      pcRef.current.addTrack(track, localStreamRef.current)
    }
  }, [])

  const handleSignal = useCallback(
    async (s: { peerId: string; kind: string; data: unknown }) => {
      const pc = pcRef.current
      if (!pc) return

      // First contact: learn the peer, decide politeness, and start media.
      if (!otherPeerRef.current) {
        otherPeerRef.current = s.peerId
        politeRef.current = peerIdRef.current < s.peerId
        startNegotiation()
      }

      try {
        if (s.kind === 'hello') {
          // Re-announce so a peer who joined after us also learns we're here.
          void send('hello', null)
          return
        }
        if (s.kind === 'bye') {
          setPhase('waiting')
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
          return
        }
        if (s.kind === 'offer' || s.kind === 'answer') {
          const desc = s.data as RTCSessionDescriptionInit
          const offerCollision =
            desc.type === 'offer' && (makingOfferRef.current || pc.signalingState !== 'stable')
          ignoreOfferRef.current = !politeRef.current && offerCollision
          if (ignoreOfferRef.current) return
          await pc.setRemoteDescription(desc)
          if (desc.type === 'offer') {
            await pc.setLocalDescription()
            await send('answer', pc.localDescription)
          }
        } else if (s.kind === 'ice') {
          try {
            await pc.addIceCandidate(s.data as RTCIceCandidateInit)
          } catch {
            if (!ignoreOfferRef.current) throw new Error('ice')
          }
        }
      } catch {
        /* tolerate transient negotiation races */
      }
    },
    [send, startNegotiation]
  )

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/webrtc/${roomId}?peerId=${peerIdRef.current}&since=${sinceRef.current}`,
        { cache: 'no-store' }
      )
      if (res.status === 403) {
        setErrorMsg('You don’t have access to this session room.')
        setPhase('error')
        if (pollRef.current) clearInterval(pollRef.current)
        return
      }
      if (!res.ok) return
      const { signals, seq } = (await res.json()) as {
        signals: { peerId: string; kind: string; data: unknown }[]
        seq: number
      }
      sinceRef.current = seq
      for (const s of signals) await handleSignal(s)
    } catch {
      /* a missed poll just retries next tick */
    }
  }, [roomId, handleSignal])

  const join = useCallback(async () => {
    setErrorMsg(null)
    setPhase('connecting')
    peerIdRef.current = crypto.randomUUID()
    stoppedRef.current = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
    } catch {
      setErrorMsg('We couldn’t access your camera or microphone. Check browser permissions.')
      setPhase('error')
      return
    }

    pcRef.current = buildPeerConnection()
    setPhase('waiting')
    await send('hello', null)
    await poll()
    pollRef.current = setInterval(poll, POLL_MS)
  }, [buildPeerConnection, poll, send])

  const leave = useCallback(() => {
    stoppedRef.current = true
    if (pollRef.current) clearInterval(pollRef.current)
    void send('bye', null)
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current = null
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    setPhase('ended')
  }, [send])

  useEffect(() => {
    return () => {
      stoppedRef.current = true
      if (pollRef.current) clearInterval(pollRef.current)
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      pcRef.current?.close()
    }
  }, [])

  function toggleMic() {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setMicOn(track.enabled)
    }
  }
  function toggleCam() {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setCamOn(track.enabled)
    }
  }

  const statusLine =
    phase === 'connecting'
      ? 'Setting up your camera…'
      : phase === 'waiting'
        ? `Waiting for ${expert} to join…`
        : phase === 'connected'
          ? 'Connected · end-to-end peer-to-peer'
          : phase === 'ended'
            ? 'Call ended'
            : ''

  return (
    <div className="call-room">
      <div className="call-stage">
        {/* Remote (expert) */}
        <div className="call-remote">
          <video ref={remoteVideoRef} autoPlay playsInline />
          {phase !== 'connected' && (
            <div className="call-overlay">
              {(phase === 'connecting' || phase === 'waiting') && (
                <Loader2 className="spin" size={28} />
              )}
              <div className="call-overlay-name">{expert}</div>
              <div className="call-overlay-sub">{statusLine || expertRole}</div>
            </div>
          )}
          <span className="call-tag">{expert}</span>
        </div>

        {/* Local (patient) */}
        <div className="call-local">
          <video ref={localVideoRef} autoPlay playsInline muted />
          {!camOn && <div className="call-overlay sm">Camera off</div>}
          <span className="call-tag">{patientName} (you)</span>
        </div>
      </div>

      {errorMsg && <div className="call-error">{errorMsg}</div>}

      <div className="call-controls">
        {phase === 'idle' || phase === 'ended' || phase === 'error' ? (
          <>
            <button className="btn btn-primary" type="button" onClick={join}>
              <Video size={16} /> {phase === 'idle' ? 'Join session' : 'Try again'}
            </button>
            <Link href="/app/sessions" className="btn btn-outline">
              Back to sessions
            </Link>
          </>
        ) : (
          <>
            <button
              className={`call-btn${micOn ? '' : ' off'}`}
              type="button"
              onClick={toggleMic}
              aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {micOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button
              className={`call-btn${camOn ? '' : ' off'}`}
              type="button"
              onClick={toggleCam}
              aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {camOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            <button className="call-btn end" type="button" onClick={leave} aria-label="Leave call">
              <PhoneOff size={20} />
            </button>
          </>
        )}
      </div>

      <p className="call-note">
        🔒 This call is peer-to-peer and end-to-end between you and your expert. getCalmly never
        records or stores the video.
      </p>
    </div>
  )
}
