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
  useToast,
} from "@chakra-ui/react";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import WeightInputModal from "@/features/modals/weightInput";
import { Ico } from "@/assets/icons";
import ExerciseLoading from "@/features/loading/ExerciseLoading";
import ExerciseLogsTable from "@/features/exerciseLogsTable";

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

interface ExerciseLog {
  id: string;
  name: string;
  scheduledDay: string;
  performedDate: string;
  performedDay: string;
  sets: number;
  maxWeight: number;
  minWeight: number;
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
  const [filteredLogs, setFilteredLogs] = useState<ExerciseLog[]>([]);
  const [filterDay, setFilterDay] = useState<string>("all");

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

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [loadingExerciseNames, setLoadingExerciseNames] = useState(true);

  const toast = useToast();

  const handleOpenWeightModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    onWeightModalOpen();
  };

  const handleOpenImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageModalOpen();
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      const [exerciseId, date, timestamp] = logId.split("_");
      const docRef = doc(
        db,
        "exerciseData",
        `${routine?.userId}_${routineId}_${exerciseId}`
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as ExerciseData;
        if (data[date]) {
          data[date] = data[date].filter(
            (entry: DailyEntry) => entry.timestamp !== timestamp
          );
          if (data[date].length === 0) {
            delete data[date];
          }
          await setDoc(docRef, data);
          setExerciseLogs((prevLogs) =>
            prevLogs.filter((log) => log.id !== logId)
          );
          toast({
            title: "Registro eliminado",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting log:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar el registro. Por favor, intente de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditLog = (log: ExerciseLog) => {
    const [exerciseId] = log.id.split("_");
    const exercise = { exerciseId };
    setSelectedExercise(exercise);
    onWeightModalOpen();
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-").map(Number);
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
  };

  const getDayOfWeek = (dateString: string): string => {
    const date = new Date(dateString + "T00:00:00Z"); // Aseguramos que se interprete como UTC
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      timeZone: "UTC",
    }).format(date);
  };

  useEffect(() => {
    const fetchRoutineAndExercises = async () => {
      if (!routineId) {
        setError("No se proporcionó un ID de rutina");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadingExerciseNames(true);
      try {
        const routineDoc = await getDoc(doc(db, "routines", routineId));

        if (routineDoc.exists()) {
          const routineData = routineDoc.data() as Omit<Routine, "id">;
          setRoutine({ id: routineId, ...routineData });
          if (routineData.trainingDays && routineData.trainingDays.length > 0) {
            setSelectedDay(routineData.trainingDays[0]);
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

          // Fetch exercise logs and calculate max weights
          const logs: ExerciseLog[] = [];
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
                let maxWeightForExercise = 0;
                Object.entries(exerciseData).forEach(([date, dailyEntries]) => {
                  dailyEntries.forEach((entry: DailyEntry) => {
                    const weights = entry.sets
                      .map((set) => set.weight)
                      .filter((weight) => weight > 0);
                    if (weights.length > 0) {
                      const maxWeightForEntry = Math.max(...weights);
                      maxWeightForExercise = Math.max(
                        maxWeightForExercise,
                        maxWeightForEntry
                      );

                      const formattedDate = formatDate(date);
                      const performedDay = getDayOfWeek(formattedDate);

                      logs.push({
                        id: `${exercise.exerciseId}_${date}_${entry.timestamp}`,
                        name:
                          exercisesData[exercise.exerciseId]?.name || "Unknown",
                        scheduledDay: dayRoutine.day,
                        performedDate: formattedDate,
                        performedDay: performedDay,
                        sets: entry.sets.length,
                        maxWeight: maxWeightForEntry,
                        minWeight: Math.min(...weights),
                      });
                    }
                  });
                });
                weightData[exercise.exerciseId] =
                  maxWeightForExercise > 0 ? maxWeightForExercise : null;
              } else {
                weightData[exercise.exerciseId] = null;
              }
            }
          }

          if (routineData && routineData.trainingDays.length > 0) {
            setFilterDay(routineData.trainingDays[0]);
          }
          setExerciseLogs(logs);
          setExerciseWeights(weightData);
        } else {
          setError("No se encontró la rutina especificada");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
      } finally {
        setIsLoading(false);
        setLoadingExerciseNames(false);
      }
    };

    fetchRoutineAndExercises();
  }, [routineId]);

  useEffect(() => {
    if (filterDay === "all") {
      setFilteredLogs(exerciseLogs);
    } else {
      setFilteredLogs(
        exerciseLogs.filter((log) => log.scheduledDay === filterDay)
      );
    }
  }, [filterDay, exerciseLogs]);

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

      <Box mt={8}>
        <Heading size="md" mb={4}>
          Registro de Ejercicios Realizados
        </Heading>
        <Select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          mb={4}
        >
          <option value="all">Todos los días</option>
          {routine?.trainingDays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
        <ExerciseLogsTable
          logs={filteredLogs}
          loadingExerciseNames={loadingExerciseNames}
          onEditLog={handleEditLog}
          onDeleteLog={handleDeleteLog}
        />
      </Box>

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
