import {
  createContext,
  useContext,
  useState
} from 'react';

import api from './api';

import socket from './socket';

const AuthContext =
  createContext();

export const AuthProvider =
({ children }) => {

  const [user, setUser] =
    useState(null);


  // LOGIN
  const login = async (
    email,
    password
  ) => {

    const res = await api.post(
      '/auth/login',
      {
        email,
        password
      }
    );

    localStorage.setItem(
      'token',
      res.data.token
    );

    setUser(res.data.user);


    // JOIN PRIVATE ROOM
    socket.emit(
      'joinUserRoom',
      res.data.user.id
    );
  };


  // REGISTER
  const register = async (
    name,
    email,
    password
  ) => {

    const res = await api.post(
      '/auth/register',
      {
        name,
        email,
        password
      }
    );

    localStorage.setItem(
      'token',
      res.data.token
    );

    setUser(res.data.user);


    // JOIN PRIVATE ROOM
    socket.emit(
      'joinUserRoom',
      res.data.user.id
    );
  };


  // LOGOUT
  const logout = () => {

    localStorage.removeItem('token');

    setUser(null);
  };


  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>
  );
};


export const useAuth = () =>
  useContext(AuthContext);