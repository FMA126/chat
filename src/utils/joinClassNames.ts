export const joinClassNames = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join("");
