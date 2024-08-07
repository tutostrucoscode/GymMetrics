import React from "react";
import {
  SimpleGrid,
  Box,
  Heading,
  Text,
  Icon,
  Flex,
  Link,
} from "@chakra-ui/react";
import TemplateGeneral from "@/features/ui/TemplateGeneral";
import { Ico } from "@/assets/icons";
import { Link as RouterLink } from "react-router-dom";
import { Path } from "@/constants";

interface DashboardItemProps {
  title: string;
  icon: React.ElementType;
  description: string;
  route: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({
  title,
  icon,
  description,
  route,
}) => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    p={5}
    shadow="md"
    position="relative"
    height="100%"
  >
    <Flex alignItems="center" mb={3}>
      <Icon as={icon} boxSize={6} mr={2} color="teal.500" />
      <Heading size="md">{title}</Heading>
    </Flex>
    <Text mb={4}>{description}</Text>
    <Link
      as={RouterLink}
      to={route}
      position="absolute"
      bottom={2}
      right={2}
      color="teal.500"
      fontWeight="bold"
      display="flex"
      alignItems="center"
    >
      Ingresar
      <Ico.ChevronRight />
    </Link>
  </Box>
);

const Dashboard = () => {
  const dashboardItems = [
    {
      title: "Rutina de ejercicios",
      icon: Ico.Dumbbell,
      description: "Gestiona tus rutinas de entrenamiento",
      route: Path.Exercises,
    },
    {
      title: "Plan alimenticio",
      icon: Ico.Utensils,
      description: "Planifica y registra tu dieta",
      route: Path.Diet,
    },
    {
      title: "Métricas generales",
      icon: Ico.ChartBar,
      description: "Visualiza tus progresos",
      route: Path.Metrics,
    },
    {
      title: "Calendario",
      icon: Ico.CalendarAlt,
      description: "Programa tus actividades",
      route: Path.Calendar,
    },
    {
      title: "Medidas y peso corporales",
      icon: Ico.Weight,
      description: "Registra tus medidas y peso",
      route: Path.Measurements,
    },
    {
      title: "Historial",
      icon: Ico.History,
      description: "Revisa tu historial de actividades",
      route: Path.History,
    },
  ];

  return (
    <TemplateGeneral>
      <Box mb={5}>
        <Heading size="lg">Dashboard</Heading>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
        {dashboardItems.map((item, index) => (
          <DashboardItem key={index} {...item} />
        ))}
      </SimpleGrid>
    </TemplateGeneral>
  );
};

export default Dashboard;
