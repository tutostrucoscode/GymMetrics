import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flex, Box } from "@chakra-ui/react";
import { Ico } from "@/assets/icons";

const exerciseIcons = [
  { icon: Ico.Dumbbell, color: "#FF6B6B" },
  { icon: Ico.Running, color: "#4ECDC4" },
  { icon: Ico.Yoga, color: "#45B7D1" },
  { icon: Ico.Bike, color: "#FFA07A" },
];

const iconVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      y: { type: "spring", stiffness: 300, damping: 10 },
      opacity: { duration: 0.2 },
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const ExerciseLoading = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % exerciseIcons.length);
    }, 1000); // Change icon every 1 second

    return () => clearInterval(timer);
  }, []);

  return (
    <Flex align="center" justify="center" height="6rem">
      <AnimatePresence mode="wait">
        <Box
          as={motion.div}
          key={currentIndex}
          variants={iconVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {React.createElement(exerciseIcons[currentIndex].icon, {
            fontSize: "48px",
            color: exerciseIcons[currentIndex].color,
          })}
        </Box>
      </AnimatePresence>
    </Flex>
  );
};

export default ExerciseLoading;
