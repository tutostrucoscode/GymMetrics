import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  Icon,
  Box,
  Flex,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { Ico } from "@/assets/icons";
import { useAppSelector } from "@/redux/hooks/hooks";
import Lenis from "lenis";

interface WeightInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: {
    exerciseId: string;
  };
  exerciseDetails: {
    name: string;
    sets: number;
  };
  routineId: string;
}

interface SetData {
  reps: number;
  weight: number;
}

interface DailyEntry {
  timestamp: string;
  sets: SetData[];
}

const WeightInputModal: React.FC<WeightInputModalProps> = ({
  isOpen,
  onClose,
  exercise,
  exerciseDetails,
  routineId,
}) => {
  const [sets, setSets] = useState<SetData[]>([]);
  const userId = useAppSelector((state) => state.auth.uid);
  const toast = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem(
      `exerciseData_${routineId}_${exercise.exerciseId}`
    );
    if (storedData) {
      setSets(JSON.parse(storedData));
    } else {
      setSets(Array(exerciseDetails.sets).fill({ reps: 0, weight: 0 }));
    }

    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    if (scrollContainerRef.current && isOpen) {
      lenisRef.current = new Lenis({
        wrapper: scrollContainerRef.current,
        content: scrollContainerRef.current.firstElementChild as HTMLElement,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "horizontal",
        gestureOrientation: "horizontal",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
      });

      requestAnimationFrame(raf);
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [routineId, exercise.exerciseId, exerciseDetails.sets, isOpen]);

  const handleChange = (
    index: number,
    field: "reps" | "weight",
    value: string
  ) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: Number(value) };
    setSets(newSets);
    updateLocalStorage(newSets);
  };

  const addNewSet = () => {
    const newSets = [...sets, { reps: 0, weight: 0 }];
    setSets(newSets);
    updateLocalStorage(newSets);
  };

  const deleteSet = (index: number) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== index);
      setSets(newSets);
      updateLocalStorage(newSets);
    }
  };

  const updateLocalStorage = (newSets: SetData[]) => {
    localStorage.setItem(
      `exerciseData_${routineId}_${exercise.exerciseId}`,
      JSON.stringify(newSets)
    );
  };

  const saveData = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No se pudo identificar al usuario.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const docRef = doc(
        db,
        "exerciseData",
        `${userId}_${routineId}_${exercise.exerciseId}`
      );
      const docSnap = await getDoc(docRef);

      let updatedData: { [key: string]: DailyEntry[] } = {};

      if (docSnap.exists()) {
        updatedData = docSnap.data() as { [key: string]: DailyEntry[] };
      }

      if (!updatedData[today]) {
        updatedData[today] = [];
      }

      updatedData[today].push({
        timestamp: new Date().toISOString(),
        sets: sets,
      });

      await setDoc(docRef, updatedData);

      localStorage.removeItem(
        `exerciseData_${routineId}_${exercise.exerciseId}`
      );
      toast({
        title: "Datos guardados",
        description: "Los datos del ejercicio se han guardado correctamente.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Error saving exercise data:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron guardar los datos. Por favor, intente de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getWeightDifference = (index: number) => {
    if (index === 0) return null;
    const currentWeight = sets[index].weight;
    const previousWeight = sets[index - 1].weight;
    if (currentWeight > previousWeight)
      return <Icon as={Ico.ChevronDoubleUp} color="green.500" />;
    if (currentWeight < previousWeight)
      return <Icon as={Ico.ChevronDoubleDown} color="red.500" />;
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="90vw">
        <ModalHeader>{exerciseDetails.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box ref={scrollContainerRef} width="100%" overflowX="auto" pb={4}>
              <Flex minWidth={`${sets.length * 170}px`}>
                {sets.map((set, index) => (
                  <Box
                    key={index}
                    width="150px"
                    flexShrink={0}
                    mr={4}
                    position="relative"
                  >
                    <Text fontWeight="bold">Set {index + 1}</Text>
                    <VStack>
                      <HStack>
                        <Text width="60px">Reps:</Text>
                        <Input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            handleChange(index, "reps", e.target.value)
                          }
                          size="sm"
                          width="60px"
                        />
                      </HStack>
                      <HStack>
                        <Text width="60px">Peso:</Text>
                        <Input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            handleChange(index, "weight", e.target.value)
                          }
                          size="sm"
                          width="60px"
                        />
                        {getWeightDifference(index)}
                      </HStack>
                    </VStack>
                    {sets.length > 1 && (
                      <IconButton
                        aria-label="Delete set"
                        icon={<Ico.MinusCircle />}
                        size="sm"
                        position="absolute"
                        top="0"
                        right="0"
                        onClick={() => deleteSet(index)}
                      />
                    )}
                  </Box>
                ))}
              </Flex>
            </Box>
            <Button onClick={addNewSet}>Añadir Nuevo Set</Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={saveData}>
            Guardar
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WeightInputModal;
