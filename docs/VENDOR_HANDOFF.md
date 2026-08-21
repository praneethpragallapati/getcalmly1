# Handing this repository to an outside vendor

What was removed, what is still here on purpose, and the things a code change
cannot fix.

---

## 1. Access control beats sanitising

Sanitising a repository is the second line of defence. The first is not handing
over the keys, and it is far stronger. Before worrying about what is in the
source, make sure the vendor cannot reach production:

- **A separate Supabase project.** Not the production database, and not a
  restored dump of it — real members' session notes, journals and mood history
  are in there, and that is the most sensitive data this product holds. Seed
  their database with `npm run db:seed`, which creates fictional accounts only.
- **Their own third-party credentials.** Separate 100ms app, separate Resend
  key, separate MSG91 account, separate AI keys. Test-tier or free-tier is fine.
  Never share a key you also use in production.
- **Their own `NEXTAUTH_SECRET`.** Sharing it would let a token minted in their
  environment be accepted by yours.
- **No production Vercel access.** Give them their own project.

If they need to reproduce a production bug, reproduce it against anonymised data
rather than a copy of the real thing.

---

## 2. What was removed from the code

- **Real password hashes.** `prisma/seed_users.sql` carried scrypt hashes of two
  real people's real passwords. A hash in a repository is offline-crackable at
  the attacker's leisure. Every seeded account is fictional now, and the one
  hash left is of a password printed in the same file — which is why it is safe.
- **A plaintext password in the docs.** `docs/DEVELOPER_GUIDE.md` printed one,
  next to the real Gmail address it belonged to.
- **Real names and personal inboxes** in `prisma/seed.ts`, `seed_users.sql` and
  `check-login.ts`.
- **Deliverable seed addresses.** Every seeded account is now under
  `example.com`, which RFC 2606 reserves and no mail server delivers to. Four
  clinician accounts were previously on `getcalmly.in` — a domain that could
  genuinely take delivery, meaning a misdirected seed could have sent OTPs or
  notifications to a live inbox.
- **A dangling script** whose filename contained two real people's names.

---

## 3. What is still here, deliberately

**Company contact details, the registered address and the legal entity name**
live in `src/config/site.ts`. They were not removed, because removing them
achieves nothing: they are printed on the public website, so a vendor who runs
the site reads them on the first page load. Hiding them in the environment would
buy no secrecy and cost real safety — a missing variable would ship a live
mental-health site showing a placeholder phone number.

If you do want a demo build with different details, it is now a one-file edit
rather than a hunt through fifteen components. That is the practical benefit.

**Crisis helpline numbers** are also constants, and must stay that way. They are
public safety information, not company data, and a blank or placeholder crisis
line is a genuine hazard.

---

## 4. What a code change cannot fix: the history

**Everything scrubbed above is still present in older commits.** A vendor
cloning the repository gets the full history, and `git log -p` shows them the
real hashes, the plaintext password and the real names exactly as they were.

Scrubbing the current files does not undo that. Pick one:

1. **Rotate the credentials.** Cheapest, and it removes the actual harm rather
   than hiding it. A hash of a password nobody uses any more is worthless, and
   this is worth doing regardless of who sees the repository:
   - Change the passwords on the two real accounts that were seeded.
   - Rotate anything ever pasted into chat, email or a ticket — the 100ms App
     Secret, the Supabase database password, any API key.
2. **Hand over a history-free export.** If the names themselves matter, give
   them a fresh repository rather than a clone:
   ```bash
   git checkout --orphan vendor-handoff
   git commit -m "Initial commit"
   ```
   They lose `git blame` and the reasoning in past commit messages, which is a
   real cost — weigh it.
3. **Rewrite history** with `git filter-repo`. Effective, but it invalidates
   every existing clone and open pull request. Only worth it if 1 and 2 are both
   unacceptable.

**Recommended: option 1.** Option 3 is rarely worth its disruption.

Also note that commit metadata carries author names and email addresses, which
no amount of file scrubbing touches.

---

## 5. Before you send it

- [ ] Rotate the two seeded accounts' real passwords.
- [ ] Rotate any secret ever shared in plaintext (100ms App Secret, Supabase DB
      password, API keys).
- [ ] Create the vendor's own Supabase project, seeded — never a production dump.
- [ ] Issue separate third-party credentials and a separate `NEXTAUTH_SECRET`.
- [ ] Confirm no `.env` file is in the archive if you send a zip rather than a
      clone (`git ls-files` will not show one; a zip of your working directory
      might contain one).
- [ ] Decide on the history: rotate, orphan-branch export, or rewrite.
- [ ] Put an NDA and a data-processing agreement in place. This is a mental
      health product; the vendor's obligations under the DPDP Act should be
      written down.

---

## 6. Where configuration lives

| Kind | Where | Why |
| --- | --- | --- |
| Secrets (API keys, DB URL, `NEXTAUTH_SECRET`) | Environment — see `.env.example` | Secret, and different per deployment |
| Per-deployment values (`NEXT_PUBLIC_SITE_URL`, 100ms role names) | Environment | Genuinely differ between local, preview and production |
| Company identity, address, socials, helplines | `src/config/site.ts` | Neither secret nor per-deployment — wants review, history and rollback |
| Brand colours, copy | Components and `globals.css` | Same reasoning |

The rule: **is it a secret, or does it differ between environments?** If neither,
it is a constant in the source, not an environment variable.
