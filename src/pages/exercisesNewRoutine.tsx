import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  Box,
  Heading,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  Button,
  useToast,
  Center,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useNavigate } from "react-router-dom";
import { Path } from "@/constants";
import DynamicSelect from "@/features/ui/DynamicSelect";
import { useAppSelector } from "@/redux/hooks/hooks";

interface ExerciseOption {
  id: string;
  name: string;
}

interface DayExercise {
  exerciseId: string;
}

interface DayRoutine {
  day: string;
  exercises: DayExercise[];
}

interface FormData {
  startWeight: number;
  waist: number;
  thigh: number;
  arm: number;
  hip: number;
  height: number;
  daysPerWeek: number;
  trainingDays: string[];
  startDate: string;
  routines: DayRoutine[];
}

const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const ExercisesNewRoutine: React.FC = () => {
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<FormData>({
    defaultValues: {
      startWeight: 0,
      waist: 0,
      thigh: 0,
      arm: 0,
      hip: 0,
      height: 0,
      daysPerWeek: 1,
      trainingDays: [],
      startDate: "",
      routines: [],
    },
  });
  const { control, handleSubmit, watch, setValue } = form;
  const {
    fields: routineFields,
    append: appendRoutine,
    update: updateRoutine,
    remove: removeRoutine,
  } = useFieldArray({
    control,
    name: "routines",
  });

  const fieldTranslations = {
    startWeight: "Peso corporal inicial",
    waist: "Cintura",
    thigh: "Muslo",
    arm: "Brazo",
    hip: "Cadera",
  };

  const toast = useToast();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth.uid);

  const daysPerWeek = watch("daysPerWeek");
  const trainingDays = watch("trainingDays");

  const handleChange = (day: string, values: string[]) => {
    console.log(`Selected exercises for ${day}:`, values);
    const routineIndex = routineFields.findIndex(
      (routine) => routine.day === day
    );
    if (routineIndex !== -1) {
      const updatedExercises = values.map((exerciseId) => ({ exerciseId }));
      updateRoutine(routineIndex, { day, exercises: updatedExercises });
    } else {
      appendRoutine({
        day,
        exercises: values.map((exerciseId) => ({ exerciseId })),
      });
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (trainingDays.length > daysPerWeek) {
      setValue("trainingDays", trainingDays.slice(0, daysPerWeek));
    }

    const updatedRoutines = trainingDays.map((day) => {
      const existingRoutine = routineFields.find((r) => r.day === day);
      return existingRoutine || { day, exercises: [] };
    });

    removeRoutine();
    updatedRoutines.forEach((routine) => appendRoutine(routine));
  }, [
    daysPerWeek,
    trainingDays,
    setValue,
    routineFields,
    removeRoutine,
    appendRoutine,
  ]);

  const fetchExercises = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching exercises...");
      const exercisesCollection = collection(db, "exercisesList");
      const exercisesSnapshot = await getDocs(exercisesCollection);
      console.log("Exercises snapshot:", exercisesSnapshot);
      const exercisesList = exercisesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log("Parsed exercises list:", exercisesList);
      setExerciseOptions(exercisesList);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los ejercicios. Por favor, intente de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Submitted data:", data);

      if (!userId) {
        throw new Error("No user ID found");
      }

      const routineData = {
        ...data,
        userId: userId,
        isHidden: false,
        startDate: new Date(data.startDate),
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "routines"), routineData);
      console.log("Document written with ID: ", docRef.id);

      toast({
        title: "Rutina guardada",
        description:
          "La nueva rutina se ha guardado correctamente en Firebase.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate(Path.Exercises);
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description:
          "No se pudo guardar la rutina. Por favor, intente de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <TemplateGeneral>
        <Center>
          <Text>Cargando ejercicios...</Text>
        </Center>
      </TemplateGeneral>
    );
  }

  if (exerciseOptions.length === 0) {
    return (
      <TemplateGeneral>
        <Center flexDirection="column" gap={4}>
          <Text>No hay ejercicios disponibles.</Text>
          <Button
            colorScheme="blue"
            onClick={() => navigate(`${Path.ExercisesNew}`)}
          >
            Crear Ejercicios
          </Button>
        </Center>
      </TemplateGeneral>
    );
  }

  return (
    <TemplateGeneral>
      <Box mb={5}>
        <Heading size="lg">Crear Nueva Rutina de Ejercicios</Heading>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={6} align="stretch">
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {(
              Object.keys(fieldTranslations) as Array<
                keyof typeof fieldTranslations
              >
            ).map((field) => (
              <FormControl key={field}>
                <FormLabel>
                  {field === "startWeight"
                    ? `${fieldTranslations[field]} (kg)`
                    : `${fieldTranslations[field]} (cm)`}
                </FormLabel>
                <Controller
                  name={field}
                  control={control}
                  rules={{ required: "Este campo es requerido" }}
                  render={({ field: { ref, ...restField } }) => (
                    <NumberInput {...restField} min={0} precision={2}>
                      <NumberInputField ref={ref} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              </FormControl>
            ))}
            <FormControl>
              <FormLabel>Altura (m)</FormLabel>
              <Controller
                name="height"
                control={control}
                rules={{ required: "Este campo es requerido" }}
                render={({ field: { ref, ...restField } }) => (
                  <NumberInput {...restField} min={0} precision={2} step={0.01}>
                    <NumberInputField ref={ref} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>Días por semana que irás al gimnasio</FormLabel>
            <Controller
              name="daysPerWeek"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select {...field}>
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Días de entrenamiento</FormLabel>
            <SimpleGrid columns={[2, 3, 4]} spacing={4}>
              {DAYS_OF_WEEK.map((day) => (
                <Controller
                  key={day}
                  name="trainingDays"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isChecked={field.value.includes(day)}
                      onChange={(e) => {
                        const updatedDays = e.target.checked
                          ? [...field.value, day]
                          : field.value.filter((d: string) => d !== day);
                        field.onChange(updatedDays);
                      }}
                      isDisabled={
                        !field.value.includes(day) &&
                        field.value.length >= daysPerWeek
                      }
                    >
                      {day}
                    </Checkbox>
                  )}
                />
              ))}
            </SimpleGrid>
          </FormControl>

          <FormControl>
            <FormLabel>Fecha de inicio</FormLabel>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input type="date" {...field} />}
            />
          </FormControl>

          {trainingDays.map((day) => (
            <DynamicSelect
              key={day}
              title={`Ejercicios para ${day}`}
              options={exerciseOptions.map((exercise) => ({
                value: exercise.id,
                label: exercise.name,
              }))}
              allowEmpty={false}
              onChange={(values) => handleChange(day, values)}
              isSearchable={true}
            />
          ))}

          <Button type="submit" colorScheme="blue">
            Guardar Rutina
          </Button>
        </VStack>
      </form>
    </TemplateGeneral>
  );
};

export default ExercisesNewRoutine;
