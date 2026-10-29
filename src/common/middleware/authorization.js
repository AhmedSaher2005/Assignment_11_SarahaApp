export const authorization = (roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error("unAuthorization", { cause: 404 });
    }

    next();
  };
};
