import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Center,
  Stack,
} from "@chakra-ui/react";
import { Ico } from "@/assets/icons";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useAppSelector } from "@/redux/hooks/hooks";
import { useNavigate } from "react-router-dom";
import { Path } from "@/constants";

interface Routine {
  id: string;
  startDate: Timestamp;
  endDate: Timestamp | null;
  duration: number;
  startWeight: number;
  endWeight: number | null;
  isHidden: boolean;
}

const Exercises = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [endWeight, setEndWeight] = useState<string>("");
  const userId = useAppSelector((state) => state.auth.uid);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchRoutines();
  }, [userId]);

  const fetchRoutines = async () => {
    const routinesRef = collection(db, "routines");
    const q = query(
      routinesRef,
      where("userId", "==", userId),
      where("isHidden", "==", false),
      orderBy("startDate", "desc")
    );

    const querySnapshot = await getDocs(q);
    const fetchedRoutines: Routine[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedRoutines.push({
        id: doc.id,
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
      } as Routine);
    });
    setRoutines(fetchedRoutines);
  };

  const handleNewRoutine = async () => {
    if (routines.length === 0) {
      navigate(`${Path.ExercisesNewRoutine}`);
      return;
    }

    try {
      const currentRoutine = routines[0];
      const now = Timestamp.now();
      await updateDoc(doc(db, "routines", currentRoutine.id), {
        endDate: now,
        endWeight: parseFloat(endWeight),
      });

      const newRoutine = {
        userId,
        startDate: now,
        endDate: null,
        duration: 0,
        startWeight: parseFloat(endWeight) || 0,
        endWeight: null,
        isHidden: false,
      };

      const docRef = await addDoc(collection(db, "routines"), newRoutine);
      onClose();

      navigate(`${Path.Exercises}/create/${docRef.id}`);
    } catch (error) {
      console.error("Error creating new routine:", error);
      toast({
        title: "Error",
        description:
          "No se pudo crear la nueva rutina. Por favor, intente de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddExercises = () => {
    navigate(`${Path.ExercisesNew}`);
  };

  const handleCreateRoutineClick = () => {
    if (routines.length === 0) {
      navigate(`${Path.ExercisesNewRoutine}`);
    } else {
      onOpen();
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "En curso";
    return timestamp.toDate().toLocaleDateString();
  };

  const calculateDuration = (
    startDate: Timestamp,
    endDate: Timestamp | null
  ) => {
    const start = startDate.toDate();
    const end = endDate ? endDate.toDate() : new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <TemplateGeneral>
      <Stack direction={{ base: "column", lg: "row" }} spacing={8}>
        {/* Routines Column */}
        <Box flex={1}>
          <Heading size="lg" mb={4}>
            Historial de Rutinas
          </Heading>
          {routines.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {routines.map((routine) => (
                <Box key={routine.id} p={4} borderWidth={1} borderRadius="md">
                  <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                  >
                    <VStack align="start" spacing={1} mb={{ base: 2, sm: 0 }}>
                      <Text fontWeight="bold">
                        {formatDate(routine.startDate)} -{" "}
                        {formatDate(routine.endDate)}
                      </Text>
                      <Text>
                        Duración:{" "}
                        {calculateDuration(routine.startDate, routine.endDate)}{" "}
                        días
                      </Text>
                      <Text>Peso inicial: {routine.startWeight} kg</Text>
                      {routine.endWeight && (
                        <Text>Peso final: {routine.endWeight} kg</Text>
                      )}
                    </VStack>
                    <Flex mt={{ base: 2, sm: 0 }}>
                      <Icon
                        as={Ico.ChevronRight}
                        boxSize={6}
                        cursor="pointer"
                        onClick={() =>
                          navigate(`${Path.Exercises}/detail/${routine.id}`)
                        }
                      />
                      <Icon
                        as={Ico.Info}
                        boxSize={6}
                        ml={2}
                        cursor="pointer"
                        onClick={() => {
                          /* Implementar lógica de comparación */
                        }}
                      />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </VStack>
          ) : (
            <Center p={8} borderWidth={1} borderRadius="md">
              <VStack>
                <Icon as={Ico.Clipboard} boxSize={12} color="gray.400" />
                <Text fontSize="lg" fontWeight="medium" textAlign="center">
                  No hay rutinas creadas
                </Text>
                <Text color="gray.500" textAlign="center">
                  Comienza creando tu primera rutina de ejercicios
                </Text>
              </VStack>
            </Center>
          )}
        </Box>

        {/* Actions Column */}
        <Box flex={1}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 1 }} spacing={4}>
            <Card>
              <CardHeader>
                <Heading size="md">Crear Nueva Rutina</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  leftIcon={<Ico.PlusCircle />}
                  colorScheme="teal"
                  onClick={handleCreateRoutineClick}
                  width="100%"
                >
                  Crear Nueva Rutina
                </Button>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <Heading size="md">Agregar Ejercicios</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  leftIcon={<Ico.Dumbbell />}
                  colorScheme="blue"
                  onClick={handleAddExercises}
                  width="100%"
                >
                  Agregar Ejercicios
                </Button>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </Stack>

      {/* Modal for creating new routine */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent margin={4}>
          <ModalHeader>Crear Nueva Rutina</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>
              Ingrese su peso actual para finalizar la rutina anterior:
            </Text>
            <Input
              placeholder="Peso en kg"
              value={endWeight}
              onChange={(e) => setEndWeight(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleNewRoutine}>
              Crear
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TemplateGeneral>
  );
};

export default Exercises;
