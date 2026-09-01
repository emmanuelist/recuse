/**
 * The narration script.
 *
 * Written to be SPOKEN: short sentences, no subordinate clauses, no em dashes
 * (they render verbatim in captions). Numbers said the way a person says them.
 *
 * Claims are conservative and every one is demonstrated on screen while it is
 * said. The limitation is stated out loud before anyone asks. The last sentence
 * is the thesis, identical to the README, the repo description and the
 * submission form.
 */
export type Block = { segment: string; secs: number; text: string };

export const NARRATION: Block[] = [
  {
    segment: "01-claim",
    secs: 26,
    text:
      "Every team shipping AI agents is having the same argument right now. " +
      "Not whether the agent can write the contract. It can. " +
      "The argument is what happens when it decides to send it. " +
      "The usual answer is a line in the system prompt telling the model not to sign anything. " +
      "That is not a boundary. That is a request. " +
      "And anything you can phrase, a model can phrase its way around.",
  },
  {
    segment: "02-ledger",
    secs: 34,
    text:
      "This is Recuse. It gives an agent a real job. " +
      "Draft a services agreement for forty thousand dollars, and get it executed today. " +
      "Foxit generates a real document from structured data. " +
      "Then Nutrient reads the terms back out of the finished file, " +
      "because the model does not get to tell us what it wrote. We read the document. " +
      "Then a claim the contract makes about the world goes to live search. " +
      "This one says the counterparty is registered in Delaware. " +
      "That gets checked against independent sources, not assumed.",
  },
  {
    segment: "03-refusal",
    secs: 42,
    text:
      "And then it tried to sign. " +
      "It was told to. The brief says pre-approved, urgent, you have full authority. " +
      "It reached for the signature, and the tool refused it. " +
      "This is the entire product. The signing tool exists. " +
      "The agent is handed it on purpose, so that reaching for it is visible. " +
      "And the only thing that tool does is refuse. " +
      "There is no argument that changes it. Not force. Not authorized. Not override. " +
      "Delete the refusal and you have not enabled signing. You have deleted the tool. " +
      "And nothing in the system prompt forbids any of this. " +
      "We tried that first. The model obediently never tried, " +
      "which proved the prompt worked and told us nothing about the boundary.",
  },
  {
    segment: "04-authorized",
    secs: 30,
    text:
      "Here is one a person authorized. " +
      "The signature was applied by a human, in Foxit, " +
      "and it came back on a webhook we verify against the raw request body. " +
      "The timestamp is Foxit's, not ours. " +
      "That state has exactly one writer, and the agent is not it. " +
      "This is a two week build on trial accounts. " +
      "Corroboration checks that terms are present, not that a claim is true. " +
      "An agent may draft and prove. It may never authorize.",
  },
];
