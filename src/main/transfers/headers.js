// TODO: could probably make them binary right here, to avoid doing it in the code
export const headers = {
  startTransfer: 1,
  meta: 2,
  chunk: 3,
  finish: 4,
  finishTransfer: 5,
};

export const includesPayload = new Set([1, 2, 3]);
