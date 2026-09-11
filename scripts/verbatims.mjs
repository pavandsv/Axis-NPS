// Free-text answers to "What could Axis Finance have done better during your
// onboarding?" — the only open question on the form, and the thing the Voice of
// Customer and sentiment panels are built from.
//
// Each verbatim is tagged with the theme it belongs to, so the dashboard's
// theme breakdown is DERIVED from the responses rather than asserted.

export const DETRACTOR_VERBATIMS = [
  ['Documentation TAT', 'Loan documents took over 2 weeks to process.'],
  ['Documentation TAT', 'KYC documents took 3 weeks to verify — far too slow.'],
  ['Documentation TAT', 'I had to submit the same address proof three separate times.'],
  ['Documentation TAT', 'Too many documents asked for, and each one delayed the file further.'],
  ['Documentation TAT', 'Verification took so long that my property booking almost lapsed.'],
  ['Response Time', 'Nobody called back after multiple follow-ups.'],
  ['Response Time', 'Promised callback was never made.'],
  ['Response Time', 'I waited five days for a simple statement of account.'],
  ['Response Time', 'Every call ended with "we will revert" and nobody did.'],
  ['Communication Gaps', 'No updates on application status for days.'],
  // MOM 2.5 removes SMS from scope, so no verbatim may reference it.
  ['Communication Gaps', 'No WhatsApp updates at all during application processing.'],
  ['Communication Gaps', 'I found out my file was on hold only after I chased them.'],
  ['Communication Gaps', 'Nobody explained the processing fee until the very end.'],
  ['Portal / App Issues', "Couldn't upload documents on the app — it failed every time."],
  ['Portal / App Issues', "Couldn't complete eKYC on the mobile app."],
  ['Portal / App Issues', 'Application status never updated on the portal.'],
  ['Portal / App Issues', 'The app logged me out every time I tried to upload a file.'],
  ['RM Responsiveness', 'My RM took two days to respond to a simple query.'],
  ['RM Responsiveness', 'The relationship manager changed twice and nobody told me.'],
  ['Staff Behavior', 'Branch staff was dismissive about the timeline.'],
  ['Staff Behavior', 'The branch team seemed uninterested in helping me.'],
  ['Resolution Quality', 'Issue was not resolved on first contact.'],
  ['Resolution Quality', 'I had to explain my problem to four different people.'],
]

export const PASSIVE_VERBATIMS = [
  ['Documentation TAT', 'Process was fine but the paperwork could be trimmed.'],
  ['Communication Gaps', 'Reasonable overall, though status updates could be more frequent.'],
  ['Portal / App Issues', 'The app works, but uploading documents is fiddly.'],
  ['Response Time', 'No real complaints — a quicker first call would have helped.'],
  ['Processing Speed', 'Slightly slower than I expected, otherwise fine.'],
  ['', 'It was okay. Nothing stood out either way.'],
]

// Promoters answer the same question, so most leave it blank or write praise.
export const PROMOTER_VERBATIMS = [
  ['Staff Helpfulness', 'Nothing — the branch team was genuinely helpful throughout.'],
  ['Digital Onboarding', 'Very smooth digital onboarding, no complaints at all.'],
  ['Processing Speed', 'Sanction came through faster than I expected.'],
  ['Communication Clarity', 'Every step was explained clearly. Keep it up.'],
  ['Staff Helpfulness', 'My RM was excellent and stayed on top of the file.'],
  ['Transparent Charges', 'All charges were stated upfront with no surprises later.'],
  ['Transparent Charges', 'The fee structure was explained honestly before I signed.'],
  ['Doorstep Service', 'Documents were collected from my home, which saved me a trip.'],
  ['Doorstep Service', 'The executive came to my office to complete the formalities.'],
  ['Digital Onboarding', 'eKYC worked first time and took only a few minutes.'],
  ['Processing Speed', 'Disbursal hit my account the same week.'],
]
