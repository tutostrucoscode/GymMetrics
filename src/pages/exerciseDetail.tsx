import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Select,
  VStack,
  Text,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useDisclosure,
  Button,
  Modal,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/configs/firebase";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import WeightInputModal from "@/features/modals/weightInput";
import { Ico } from "@/assets/icons";
import ExerciseLoading from "@/features/loading/ExerciseLoading";

interface Exercise {
  exerciseId: string;
  name?: string;
  sets?: number;
  reps?: number;
}

interface DayRoutine {
  day: string;
  exercises: Exercise[];
}

interface Routine {
  id: string;
  userId: string;
  startDate: {
    seconds: number;
    nanoseconds: number;
  };
  endDate: {
    seconds: number;
    nanoseconds: number;
  } | null;
  trainingDays: string[];
  routines: DayRoutine[];
}

interface ExerciseDetails {
  [key: string]: {
    name: string;
    sets: number;
    reps: number;
    imageUrl: string;
  };
}

interface ExerciseWeightData {
  [exerciseId: string]: number | null;
}

interface DailyEntry {
  timestamp: string;
  sets: Array<{
    reps: number;
    weight: number;
  }>;
}

interface ExerciseData {
  [date: string]: DailyEntry[];
}

const ExerciseDetailPage: React.FC = () => {
  const { routineId } = useParams<{ routineId: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDetails>({});
  const [exerciseWeights, setExerciseWeights] = useState<ExerciseWeightData>(
    {}
  );

  const {
    isOpen: isWeightModalOpen,
    onOpen: onWeightModalOpen,
    onClose: onWeightModalClose,
  } = useDisclosure();
  const {
    isOpen: isImageModalOpen,
    onOpen: onImageModalOpen,
    onClose: onImageModalClose,
  } = useDisclosure();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleOpenWeightModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    onWeightModalOpen();
  };

  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageModalOpen();
  };

  useEffect(() => {
    const fetchRoutineAndExercises = async () => {
      if (!routineId) {
        console.log("No routineId provided");
        setError("No se proporcionó un ID de rutina");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log("Fetching routine with ID:", routineId);
        const routineDoc = await getDoc(doc(db, "routines", routineId));

        if (routineDoc.exists()) {
          console.log("Routine document exists");
          const routineData = routineDoc.data() as Omit<Routine, "id">;
          console.log("Routine data:", routineData);

          setRoutine({ id: routineId, ...routineData });
          if (routineData.trainingDays && routineData.trainingDays.length > 0) {
            setSelectedDay(routineData.trainingDays[0]);
          } else {
            console.log("No training days found in routine data");
          }

          // Fetch exercise details
          const exercisesSnapshot = await getDocs(
            collection(db, "exercisesList")
          );
          const exercisesData: ExerciseDetails = {};
          exercisesSnapshot.forEach((doc) => {
            exercisesData[doc.id] = doc.data() as ExerciseDetails[string];
          });
          setExerciseDetails(exercisesData);

          // Fetch exercise weight data
          const weightData: ExerciseWeightData = {};
          for (const dayRoutine of routineData.routines) {
            for (const exercise of dayRoutine.exercises) {
              const exerciseDataDoc = await getDoc(
                doc(
                  db,
                  "exerciseData",
                  `${routineData.userId}_${routineId}_${exercise.exerciseId}`
                )
              );
              if (exerciseDataDoc.exists()) {
                const exerciseData = exerciseDataDoc.data() as ExerciseData;
                const allWeights = Object.values(exerciseData)
                  .flatMap((dailyEntries: DailyEntry[]) =>
                    dailyEntries.flatMap((entry: DailyEntry) =>
                      entry.sets.map((set) => set.weight)
                    )
                  )
                  .filter((weight: number) => weight > 0);

                if (allWeights.length > 0) {
                  const weightCounts: { [key: number]: number } =
                    allWeights.reduce(
                      (acc: { [key: number]: number }, weight: number) => {
                        acc[weight] = (acc[weight] || 0) + 1;
                        return acc;
                      },
                      {}
                    );
                  const maxWeight = Object.entries(weightCounts).reduce(
                    (a, b) => (a[1] > b[1] ? a : b)
                  )[0];
                  weightData[exercise.exerciseId] = Number(maxWeight);
                } else {
                  weightData[exercise.exerciseId] = null;
                }
              } else {
                weightData[exercise.exerciseId] = null;
              }
            }
          }
          setExerciseWeights(weightData);
        } else {
          console.log("Routine document does not exist");
          setError("No se encontró la rutina especificada");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineAndExercises();
  }, [routineId]);

  if (isLoading) {
    return (
      <TemplateGeneral>
        <Center h="200px">
          <ExerciseLoading />
        </Center>
      </TemplateGeneral>
    );
  }

  if (error) {
    return (
      <TemplateGeneral>
        <Center h="200px">
          <Text color="red.500">{error}</Text>
        </Center>
      </TemplateGeneral>
    );
  }

  if (!routine) {
    return (
      <TemplateGeneral>
        <Center h="200px">
          <Text>No se encontró la rutina</Text>
        </Center>
      </TemplateGeneral>
    );
  }

  const selectedDayExercises =
    routine.routines.find((dayRoutine) => dayRoutine.day === selectedDay)
      ?.exercises || [];

  return (
    <TemplateGeneral>
      <Box mb={5}>
        <Heading size="lg">Detalles de la Rutina</Heading>
        <Text mt={2}>
          Fecha de inicio:{" "}
          {new Date(routine.startDate.seconds * 1000).toLocaleDateString()}
        </Text>
        {routine.endDate && (
          <Text>
            Fecha de fin:{" "}
            {new Date(routine.endDate.seconds * 1000).toLocaleDateString()}
          </Text>
        )}
      </Box>

      <Box mb={5}>
        <Select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          placeholder="Selecciona un día"
        >
          {routine.trainingDays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      </Box>

      {selectedDay && (
        <VStack spacing={4} align="stretch">
          <Heading size="md">Ejercicios para {selectedDay}</Heading>
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {selectedDayExercises.map((exercise, index) => {
              const details = exerciseDetails[exercise.exerciseId];
              const maxWeight = exerciseWeights[exercise.exerciseId];
              return (
                <Card key={index}>
                  <CardHeader>
                    <Heading size="sm">
                      {details?.name || "Nombre no disponible"}
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Text>Series: {details?.sets || "N/A"}</Text>
                    <Text>Repeticiones: {details?.reps || "N/A"}</Text>
                    {maxWeight !== null && (
                      <Text>Peso máximo: {maxWeight} kg</Text>
                    )}
                    <Button
                      mt={2}
                      onClick={() => handleOpenWeightModal(exercise)}
                    >
                      Registrar Pesos
                    </Button>
                    <IconButton
                      aria-label="Ver imagen"
                      icon={<Ico.Info />}
                      ml={2}
                      onClick={() => handleOpenImageModal(details?.imageUrl)}
                    />
                  </CardBody>
                </Card>
              );
            })}
          </SimpleGrid>
        </VStack>
      )}

      {selectedExercise && (
        <WeightInputModal
          isOpen={isWeightModalOpen}
          onClose={onWeightModalClose}
          exercise={selectedExercise}
          exerciseDetails={exerciseDetails[selectedExercise.exerciseId]}
          routineId={routineId || ""}
        />
      )}

      <Modal isOpen={isImageModalOpen} onClose={onImageModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Imagen del Ejercicio</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={selectedImage} alt="Ejercicio" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </TemplateGeneral>
  );
};

export default ExerciseDetailPage;
