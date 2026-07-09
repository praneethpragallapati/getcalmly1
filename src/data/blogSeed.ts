// Single source of truth for blog content. Used by:
//   • prisma/seed.ts       , to populate the database
//   • src/lib/blog.ts      , as a fallback when the DB is unreachable
// Keep this file the canonical copy; edit here and re-seed to publish changes.

export type BlogSeed = {
  slug: string
  title: string
  excerpt: string
  author: string
  role: string
  date: string // human display date, e.g. "12 June 2026"
  readTime: string
  tags: string[]
  content: string[] // ordered paragraphs
}

export const blogSeed: BlogSeed[] = [
  {
    slug: 'when-anxiety-feels-like-intuition',
    title: 'When Anxiety Feels Like Intuition',
    excerpt:
      'I spent years trusting my "gut", only to realise I was mistaking chronic worry for wisdom. Here is how I learned to tell the difference in my sessions.',
    author: 'Dr. Meera Krishnan',
    role: 'Clinical Psychologist',
    date: '12 June 2026',
    readTime: '6 min read',
    tags: ['anxiety', 'self-awareness', 'therapy'],
    content: [
      `For almost a decade, I sat with clients who described the same thing: a deep, bone-level certainty that something was wrong. Not anxious rumination, they would insist, real intuition. A knowing. And yet, when we slowed down and traced the thought, it almost always led back to the same place: a mind that had been on high-alert for so long that vigilance had become its resting state. That hypervigilance had convinced itself it was wisdom.`,
      `The physiological overlap between anxiety and intuition is real, and it is worth taking seriously. Both activate the autonomic nervous system. Both create a quickening of the heart, a tightening of the chest, a pull toward action. The ancient brain does not clearly distinguish between "I should trust this feeling" and "I am in a threat response." It simply fires. So when a client tells me their gut is telling them not to take the job, or to leave the relationship, I do not dismiss that signal, but I also do not accept it at face value without examination.`,
      `Cognitive Behavioural Therapy gave me, and my clients, a language for this examination. The thought record, that deceptively simple tool of writing down the thought, the evidence for it, the evidence against it, and the more balanced conclusion, is where the distinction between anxiety and intuition often becomes visible. Anxiety tends to be absolute: it catastrophises, and it picks its evidence. Intuition, when it is signal rather than noise, tends to be quieter, more specific, and not contingent on a worst-case outcome.`,
      `One client, I will call her Priya, came to me convinced that her business partner was planning to betray her. Every interaction felt like confirmation. She lost sleep. She rehearsed confrontations at 3 a.m. When we mapped the evidence together, what emerged was not a pattern of betrayal but a pattern of Priya's nervous system scanning relentlessly for threat, shaped, we discovered, by a childhood in which betrayal had been sudden and total. Her "gut" was not detecting present danger. It was re-running an old alarm.`,
      `The practical question I give every client: does the feeling expand or contract when you sit with it? Intuition tends to clarify when you give it space. Anxiety tends to amplify. If you write down the fear and come back to it the next morning and it has grown three new catastrophic branches, that is usually anxiety. If the quiet sense of wrongness remains consistent and specific, it deserves more attention.`,
      `None of this means anxiety is untrustworthy. Sometimes the alarm is pointing at something real. But learning to distinguish between the two, between the mind protecting you and the mind terrorising you, is one of the most freeing skills I know. It is also one of the things therapy does best: it slows the loop down enough for you to see what is inside it.`,
    ],
  },
  {
    slug: 'postpartum-is-not-just-baby-blues',
    title: 'Postpartum Is Not Just Baby Blues',
    excerpt:
      'New mothers are told to "enjoy every moment," but no one talks about the fog, the guilt, or the rage. As a therapist and a mother, I want to change that.',
    author: 'Dr. Shruti Agarwal',
    role: 'Perinatal Mental Health Specialist',
    date: '8 June 2026',
    readTime: '8 min read',
    tags: ['postpartum', 'mothers-health', 'depression'],
    content: [
      `When I became a mother, I already had eight years of clinical experience working with women in the perinatal period. I knew the research. I had held space for hundreds of women in the fog of postpartum mood disorders. And then I had my own child, and somewhere around week three, I found myself sitting on the bathroom floor at 2 a.m., absolutely certain I had made a catastrophic mistake, not just with one decision but with my entire life. Nothing in my training had prepared me for how convincing that thought would feel.`,
      `In India, the postpartum period is often held by the family. New mothers are surrounded, fed, watched, advised, celebrated. But this visibility can paradoxically make it harder to speak honestly. When your mother-in-law is cooking for you and your husband has taken two weeks off work, who do you tell that you feel hollow? That the baby's cry sends a spike of something that feels uncomfortably close to rage? The cultural frame is "you should be grateful," and that frame does not leave much room for "I am not okay."`,
      `Postpartum depression is not just sadness. The presentation is frequently anxiety, racing thoughts, terror that something will happen to the baby, intrusive images of harm that the mother finds deeply distressing precisely because she loves her child. It is also, sometimes, numbness: a flatness, a going-through-the-motions quality that looks like coping from the outside and feels like absence from the inside. It can be irritability, rage, an inability to be alone with the baby, or an inability to let anyone else hold them.`,
      `The signs that are worth taking seriously: persistent low mood for more than two weeks, inability to sleep even when the baby sleeps, intrusive or frightening thoughts, feeling disconnected from the baby or from yourself, and a sense that you are not the right person for this child. These are not character flaws. They are symptoms of a highly treatable condition. Untreated postpartum depression has consequences for both mother and child that go well beyond those early months, attachment, development, and the mother's own long-term mental health are all affected.`,
      `Partners and family carry real power here. The research is unambiguous: perceived social support is one of the strongest protective factors against postpartum depression. But support means more than practical help. It means creating the conditions in which a new mother can say something true without fear of being judged, dismissed, or told she will feel better soon. "How are you actually doing?" asked with enough time and quiet to get a real answer, is not a small thing.`,
      `If you are a new mother reading this: you are allowed to be struggling. The love is real. So is the difficulty. One does not cancel the other. Please speak to your gynaecologist, your GP, or a perinatal mental health professional. Therapy works. Medication is safe during breastfeeding when indicated. You do not have to earn the right to help by suffering a particular amount first.`,
    ],
  },
  {
    slug: 'why-men-in-india-dont-go-to-therapy',
    title: "Why Men in India Don't Go to Therapy (And What Shifts That)",
    excerpt:
      "My male clients rarely walk in by choice. Most come because someone who loves them asked them to. That first conversation is everything, here's what I've learnt.",
    author: 'Dr. Rahul Nair',
    role: 'Counselling Psychologist',
    date: '3 June 2026',
    readTime: '7 min read',
    tags: ['men-mental-health', 'stigma', 'relationships'],
    content: [
      `In nine years of practice, I can count on one hand the number of male clients who walked through my door entirely of their own accord, on their own timeline, without any external prompt. Every other man who has sat across from me came because his partner asked, or because his doctor referred him, or because something had gone badly enough wrong at work or at home that not coming felt like a worse option than coming. And here is what I want to say about that: it is completely fine. The reason you arrive matters far less than the fact that you arrive.`,
      `But it is worth understanding why the barrier exists. Indian masculinity carries a very specific architecture. Strength is silence. Need is weakness. Asking for help, especially for something as internal and un-mappable as emotional pain, is read as a failure of self-sufficiency. The men I work with were often raised in households where the dominant emotional vocabulary available to men was anger: the one feeling that could be expressed without loss of face. Everything else, grief, fear, loneliness, confusion, got routed through anger or got buried entirely. By the time they are sitting in my office, many of them have been burying things for twenty or thirty years.`,
      `The first session is almost always the same. Guardedness. A slightly defensive recounting of the facts of the situation, the presenting problem framed as a practical problem requiring a practical solution. Fine. I work with that. I am not looking for breakthrough vulnerability in the first hour. I am looking for enough trust to make a second appointment feel possible. Sometimes we spend the first session talking about almost nothing of consequence, and that is okay too.`,
      `What breaks the ice, in my experience, is humanness rather than technique. When I disclose, carefully and appropriately, that I have had my own difficult periods. When I treat the man across from me as an intelligent adult who can handle complexity rather than someone who needs to be guided slowly through emotions as if they were a foreign language. When I make it clear that I have no investment in any particular outcome, that my job is to create a space in which he can think more clearly, not to tell him what to feel or who to be.`,
      `For partners who are reading this and wondering how to encourage someone they love: the worst approach is the ultimatum, except in situations of genuine risk. The best approach is curiosity. "I've noticed you seem to be carrying a lot. I wonder if talking to someone might help, not because something is wrong with you, but because you deserve support too." And then drop it. Plant the seed, leave it alone. Men who feel cornered retreat. Men who feel invited sometimes, eventually, walk through.`,
      `I also want to say this directly to the men: therapy is not a place where someone tells you what is wrong with you, and it is not years spent reliving your childhood. It is a practical space where you can think out loud with someone who has no agenda in your life. Most men I work with describe it, after a few months, as something between a useful debriefing and a physiotherapy session for the mind. It costs you time and money. It also returns to you things you did not know you had lost.`,
    ],
  },
  {
    slug: 'the-truth-about-cbt',
    title: 'The Truth About CBT That No One Mentions in the Brochure',
    excerpt:
      'Cognitive Behavioural Therapy works. But it also asks you to challenge thoughts that feel completely true. My clients often hate the first few weeks, and then something shifts.',
    author: 'Dr. Ananya Sharma',
    role: 'Clinical Psychologist, CBT Specialist',
    date: '28 May 2026',
    readTime: '9 min read',
    tags: ['cbt', 'therapy', 'anxiety', 'depression'],
    content: [
      `Cognitive Behavioural Therapy has excellent marketing. The evidence base is strong, the model is intuitive, and the timeframe is appealingly finite, twelve to twenty sessions, a clear structure, measurable outcomes. What the brochure does not tell you is that the first few weeks are often deeply uncomfortable, and that the discomfort usually means the therapy is working.`,
      `CBT works by asking you to examine the relationship between your thoughts, feelings, and behaviours. The core insight, that our interpretation of events drives our emotional responses more than the events themselves, sounds reasonable in the abstract. It is considerably harder to sit with when the thought being examined feels completely and obviously true. When a client tells me "I know I am going to fail the presentation," we are not dealing with a thought they hold loosely. We are dealing with a conviction. Asking someone to question a conviction they have held for years, about themselves, in the midst of a period when they are already struggling, that is not comfortable work.`,
      `The homework myth is worth addressing. CBT involves between-session work: thought records, behavioural experiments, activity scheduling. Clients sometimes arrive having done none of it and feel they have failed before the session starts. I want to say clearly: the work that happens in the session matters as much as the work between sessions. If you came in having done nothing and you are here, you have already done something. We will work with what you have. Not doing homework is often itself data, what got in the way? What felt too hard? That is worth talking about.`,
      `Cognitive restructuring, the process of examining and modifying unhelpful thought patterns, is frequently described in terms that make it sound like a logic exercise. It is not, or not only. When it is working, what changes is not just the content of the thought but the relationship to the thought. The client begins to hold their interpretations a little more lightly. They develop what I think of as a small internal observer, a part that can notice "I am having the thought that I am a failure" rather than simply being that thought. That shift in perspective is subtle but its effects are not.`,
      `Outcomes in CBT are usually not dramatic. Most people do not have a single breakthrough session where everything clarifies. Progress tends to be incremental and then, looking back over three months, surprisingly significant. Clients often describe feeling better before they fully understand why, the behavioural changes (getting up at a regular time, going for a walk, doing one thing they have been avoiding) begin to shift the mood before the cognitive work has fully landed. That is fine. Both channels matter.`,
      `I also want to be honest about what CBT is not. It is not a cure for everything. It does not work equally well for all presentations or all people, and recognising that early and finding a better fit is simply good clinical practice. Some clients need something more relational, more exploratory, more somatic. But for anxiety and depression in particular, the evidence for CBT is the best we have, and I have seen it change people's lives. The hard things do not disappear; they become easier to carry.`,
    ],
  },
  {
    slug: 'grief-has-no-timeline',
    title: 'Grief Has No Timeline',
    excerpt:
      'A year after the loss, people expect you to be "over it." But grief is not linear, and as someone who has sat with hundreds of grieving clients, I can tell you: there is no right way through it.',
    author: 'Dr. Fathima Zahra',
    role: 'Grief & Trauma Counsellor',
    date: '20 May 2026',
    readTime: '6 min read',
    tags: ['grief', 'loss', 'self-awareness'],
    content: [
      `The most damaging thing we have told people about grief is that it has stages. Not because the stages model is entirely wrong, Elisabeth Kübler-Ross was describing something real, but because it was never intended as a roadmap, and it has been used as one. Clients arrive in my room apologising for still being in the wrong stage, or for having moved through a stage too quickly, or for cycling back to anger after what felt like acceptance. They have been handed a script for their grief and are failing to follow it. This is an additional cruelty layered onto an already unbearable experience.`,
      `Grief is not linear. It does not move toward a finish line, and it does not complete. What changes, with time and sometimes with support, is the relationship between the person and their loss, the way the loss sits inside a life that is still being lived. Some days the grief is the whole weather. Other days it is background. Neither is more correct than the other. Grief researchers now talk about oscillation: moving between loss-orientation (confronting the grief) and restoration-orientation (attending to daily life). Both are necessary and healthy.`,
      `In India, grief is often held collectively, by family, by community, by religious ritual. This can be profoundly sustaining. It can also, sometimes, close off individual processing. When grief is witnessed publicly through rituals that end after thirteen days, or forty, there can be an implicit expectation that the mourner returns to ordinary life on schedule. The community has done its part. The clock has run. For someone still raw six months later, this can feel like abandonment dressed as normalcy.`,
      `What is called disenfranchised grief is particularly worth naming. This is grief that society does not fully recognise or permit: the loss of a pregnancy, the death of an estranged parent, the end of a relationship that was not sanctioned, the slow grief of watching someone disappear into dementia while they are still technically alive. These griefs are often carried silently and without community support, which compounds the weight considerably. When a client tells me about a loss they have never told anyone about, the room often changes. Simply naming it, "that is a real loss, and you are allowed to grieve it", can be significant.`,
      `What therapy offers in grief is not acceleration. I want to be very clear about this: my job is not to help someone get through their grief faster. It is to offer accompaniment. A space in which the loss can be spoken, in which the complexity of grief, which is rarely pure sadness and often contains love, anger, relief, guilt, and tenderness in uncomfortable combination, can be held without judgement. Often the grief itself is not the problem; the isolation of carrying it alone is.`,
      `If you are reading this in the middle of a loss: there is no right way to grieve. You do not have to "move on," and you do not have to be stronger than you feel. You are allowed to be exactly where you are. And if the weight becomes too heavy to carry alone, reaching out takes more courage than staying silent.`,
    ],
  },
]
