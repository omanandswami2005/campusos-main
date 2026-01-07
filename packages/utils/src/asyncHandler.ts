export const asyncHandler = (requestHandler: (...args: any[]) => any) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
