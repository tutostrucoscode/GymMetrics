import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import { Ico } from "@/assets/icons";

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

interface ExerciseLogsTableProps {
  logs: ExerciseLog[];
  loadingExerciseNames: boolean;
  onEditLog: (log: ExerciseLog) => void;
  onDeleteLog: (logId: string) => void;
}

const ExerciseLogsTable: React.FC<ExerciseLogsTableProps> = ({
  logs,
  loadingExerciseNames,
  onEditLog,
  onDeleteLog,
}) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Nombre del Ejercicio</Th>
          <Th>Día Programado</Th>
          <Th>Fecha Realizada</Th>
          <Th>Día Realizado</Th>
          <Th>Sets</Th>
          <Th>Peso Máximo</Th>
          <Th>Peso Mínimo</Th>
          <Th>Acciones</Th>
        </Tr>
      </Thead>
      <Tbody>
        {logs.map((log) => (
          <Tr key={log.id}>
            <Td>
              {loadingExerciseNames ? (
                <Skeleton height="20px" width="150px" />
              ) : (
                log.name
              )}
            </Td>
            <Td>{log.scheduledDay}</Td>
            <Td>{log.performedDate}</Td>
            <Td>{log.performedDay}</Td>
            <Td>{log.sets}</Td>
            <Td>{log.maxWeight} kg</Td>
            <Td>{log.minWeight} kg</Td>
            <Td>
              <IconButton
                aria-label="Editar registro"
                icon={<Ico.Clipboard />}
                size="sm"
                mr={2}
                onClick={() => onEditLog(log)}
              />
              <IconButton
                aria-label="Eliminar registro"
                icon={<Ico.MinusCircle />}
                size="sm"
                colorScheme="red"
                onClick={() => onDeleteLog(log.id)}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ExerciseLogsTable;
