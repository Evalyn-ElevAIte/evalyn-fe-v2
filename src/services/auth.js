import api from "./api";

export const login = (email, password) => {
  return api.post("/auth/login", { email, password });
};

export const register = (name, email, password) => {
  return api.post("/auth/register", { name, email, password });
};

export const googleAuth = (id_token) => {
  return api.post("/auth/google", { id_token });
};
