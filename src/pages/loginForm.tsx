import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  VStack,
  Text,
  useToast,
  Box,
  Flex,
  useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks/hooks";
import { login } from "@/redux/actions/auth";
import { auth } from "@/configs/firebase";
import { Ico } from "@/assets/icons";
import { Navigate, useNavigate } from "react-router-dom";
import { Path } from "@/constants";
import AnimatedBorderBox from "@/features/ui/AnimatedBorderBox";

const LoginForm: React.FC = () => {
  const { handleSubmit } = useForm();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => !!state.auth.uid);

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const containerBgColor = useColorModeValue("gray.50", "gray.900");

  useEffect(() => {
    if (isAuthenticated) {
      navigate(Path.Dashboard);
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      dispatch(login(user.uid, user.displayName, user.email, user.photoURL));

      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate(Path.Dashboard);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast({
        title: "Login failed",
        description: "An error occurred during sign-in",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isAuthenticated) {
    return <Navigate to={Path.Dashboard} replace />;
  }

  return (
    <Flex
      minHeight="100vh"
      width="100%"
      align="center"
      justify="center"
      p={4}
      bg={containerBgColor}
    >
      <AnimatedBorderBox
        maxWidth={{ base: "90%", sm: "400px" }}
        width="100%"
        boxShadow="xl"
      >
        <Box p={{ base: 6, sm: 8 }} bg={bgColor} borderRadius="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <Heading
                fontSize={{ base: "2xl", sm: "3xl" }}
                fontWeight="bold"
                textAlign="center"
              >
                Bienvenido a GymMetrics
              </Heading>
              <Text
                fontSize={{ base: "sm", sm: "md" }}
                textAlign="center"
                color={textColor}
              >
                Inicia sesión para realizar un seguimiento de tu estado físico y
                alcanzar tus objetivos
              </Text>
              <Button
                leftIcon={<Ico.Google />}
                colorScheme="blue"
                variant="solid"
                type="submit"
                size="lg"
                w="100%"
                fontSize={{ base: "md", sm: "lg" }}
              >
                Iniciar sesión con Google
              </Button>
            </VStack>
          </form>
        </Box>
      </AnimatedBorderBox>
    </Flex>
  );
};

export default LoginForm;
