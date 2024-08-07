import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  SimpleGrid,
  useBreakpointValue,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { Ico } from "@/assets/icons";

interface ExerciseFormData {
  name: string;
  sets: number;
  reps: number;
  imageUrl: string;
  type: string;
}

interface Exercise extends ExerciseFormData {
  id: string;
}

const ExercisesNew = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExerciseFormData>();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const exercisesCollection = collection(db, "exercisesList");
      const exercisesSnapshot = await getDocs(exercisesCollection);
      const exercisesList = exercisesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exercise[];
      setExercises(exercisesList);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los ejercicios.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onSubmit = async (data: ExerciseFormData) => {
    try {
      if (editingExercise) {
        const updatedData = {
          name: data.name,
          sets: data.sets,
          reps: data.reps,
          imageUrl: data.imageUrl,
          type: data.type,
        };
        await updateDoc(
          doc(db, "exercisesList", editingExercise.id),
          updatedData
        );
        toast({
          title: "Ejercicio actualizado",
          description: "El ejercicio se ha actualizado correctamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setEditingExercise(null);
      } else {
        await addDoc(collection(db, "exercisesList"), data);
        toast({
          title: "Ejercicio creado",
          description: "El ejercicio se ha añadido correctamente.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
      reset();
      fetchExercises();
      onClose();
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast({
        title: "Error",
        description:
          "No se pudo guardar el ejercicio. Por favor, intente de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      await deleteDoc(doc(db, "exercisesList", id));
      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio se ha eliminado correctamente.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchExercises();
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar el ejercicio. Por favor, intente de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setValue("name", exercise.name);
    setValue("sets", exercise.sets);
    setValue("reps", exercise.reps);
    setValue("imageUrl", exercise.imageUrl);
    setValue("type", exercise.type);
    if (!isMobile) {
      onOpen();
    }
  };

  const handleCloseModal = () => {
    setEditingExercise(null);
    reset();
    onClose();
  };

  const ExerciseForm = () => (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Nombre del ejercicio</FormLabel>
          <Input
            {...register("name", { required: "Este campo es requerido" })}
          />
        </FormControl>

        <SimpleGrid columns={2} spacing={4}>
          <FormControl isInvalid={!!errors.sets}>
            <FormLabel>Número de series</FormLabel>
            <NumberInput min={1}>
              <NumberInputField
                {...register("sets", {
                  required: "Este campo es requerido",
                  min: 1,
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl isInvalid={!!errors.reps}>
            <FormLabel>Repeticiones por serie</FormLabel>
            <NumberInput min={1}>
              <NumberInputField
                {...register("reps", {
                  required: "Este campo es requerido",
                  min: 1,
                })}
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        <FormControl isInvalid={!!errors.imageUrl}>
          <FormLabel>URL de la imagen</FormLabel>
          <Input
            {...register("imageUrl", {
              required: "Este campo es requerido",
            })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Tipo de ejercicio (opcional)</FormLabel>
          <Select {...register("type")} placeholder="Selecciona un tipo">
            <option value="pectoral">Pectoral</option>
            <option value="pierna">Pierna</option>
            <option value="espalda">Espalda</option>
            <option value="tricep">Tríceps</option>
            <option value="bicep">Bíceps</option>
            <option value="hombro">Hombro</option>
            <option value="abdominales">Abdominales</option>
            <option value="Trapecio">Trapecio</option>
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="blue" width="100%">
          {editingExercise ? "Actualizar Ejercicio" : "Crear Ejercicio"}
        </Button>
      </VStack>
    </form>
  );

  return (
    <TemplateGeneral>
      <VStack spacing={10} align="stretch">
        <Box>
          <Heading size="lg" mb={5}>
            Crear Ejercicio
          </Heading>
          <ExerciseForm />
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Lista de Ejercicios
          </Heading>
          {isMobile ? (
            <VStack spacing={4} align="stretch">
              {exercises.map((exercise) => (
                <Box key={exercise.id} p={4} borderWidth={1} borderRadius="md">
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">{exercise.name}</Text>
                      <Text>Series: {exercise.sets}</Text>
                      <Text>Repeticiones: {exercise.reps}</Text>
                      <Text>Tipo: {exercise.type}</Text>
                    </VStack>
                    <Flex>
                      <IconButton
                        aria-label="Edit exercise"
                        icon={<Ico.Clipboard />}
                        colorScheme="blue"
                        mr={2}
                        onClick={() => handleEditExercise(exercise)}
                      />
                      <IconButton
                        aria-label="Delete exercise"
                        icon={<Ico.MinusCircle />}
                        colorScheme="red"
                        onClick={() => handleDeleteExercise(exercise.id)}
                      />
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </VStack>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Series</Th>
                    <Th>Repeticiones</Th>
                    <Th>Tipo</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {exercises.map((exercise) => (
                    <Tr key={exercise.id}>
                      <Td>{exercise.name}</Td>
                      <Td>{exercise.sets}</Td>
                      <Td>{exercise.reps}</Td>
                      <Td>{exercise.type}</Td>
                      <Td>
                        <IconButton
                          aria-label="Edit exercise"
                          icon={<Ico.Clipboard />}
                          colorScheme="blue"
                          mr={2}
                          onClick={() => handleEditExercise(exercise)}
                        />
                        <IconButton
                          aria-label="Delete exercise"
                          icon={<Ico.MinusCircle />}
                          colorScheme="red"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>

      {/* Modal para edición en dispositivos no móviles */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} closeOnEsc={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Ejercicio</ModalHeader>
          <ModalBody>
            <ExerciseForm />
          </ModalBody>
        </ModalContent>
      </Modal>
    </TemplateGeneral>
  );
};

export default ExercisesNew;
