import { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Path } from "../../constants";
import NotFound from "../../pages/notFound";
import PrivateRoute from "./private-route";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../configs/firebase";
import Loading from "../loading";
import { useAppDispatch } from "@/redux/hooks/hooks";
import { login, startLogout } from "@/redux/actions/auth";
import LoginForm from "@/pages/loginForm";
import Dashboard from "@/pages/dashboard";
import Exercises from "@/pages/exercises";
import ExercisesNewRoutine from "@/pages/exercisesNewRoutine";
import ExercisesNew from "@/pages/exercisesNew";
import ExerciseDetail from "@/pages/exerciseDetail";
import { Center } from "@chakra-ui/react";
import ExerciseLoading from "../loading/ExerciseLoading";

const AppRouters = () => {
  const dispatch = useAppDispatch();
  const [session, setSession] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unregisterAuthObserver = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        console.log("useEffect onAuthStateChanged user.email", user.email);
        const { photoURL, email, uid, displayName } = user;
        dispatch(login(uid, displayName, email, photoURL));
        setSession(true);
      } else {
        console.log("useEffect onAuthStateChanged NO USER");
        dispatch(startLogout());
        setSession(false);
      }
    });

    return () => {
      console.log("Se retorno el ciclo de vida en useEffect - AppRouters");
      unregisterAuthObserver();
    };
  }, [dispatch]);

  if (isLoading) {
    return (
      <Center h="200px">
        <ExerciseLoading />
      </Center>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path={Path.Index} element={<LoginForm />} />
          <Route path="*" element={<NotFound />} />
          <Route path={Path.Auth} element={<LoginForm />} />
          {/* <Route path={Path.Auth} element={<Auth />} /> */}
          <Route element={<PrivateRoute canActivate={session} />}>
            <Route path={Path.Dashboard} element={<Dashboard />} />
            <Route path={Path.Exercises} element={<Exercises />} />
            <Route
              path={Path.ExercisesNewRoutine}
              element={<ExercisesNewRoutine />}
            />
            <Route path={Path.ExercisesNew} element={<ExercisesNew />} />
            <Route
              path={`${Path.Exercises}/detail/:routineId`}
              element={<ExerciseDetail />}
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouters;
