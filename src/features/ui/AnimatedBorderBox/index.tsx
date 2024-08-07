import React from "react";
import { Box, BoxProps } from "@chakra-ui/react";
import { motion, MotionProps } from "framer-motion";

interface AnimatedBorderBoxProps extends BoxProps {
  children: React.ReactNode;
}

const MotionBox = motion(Box);

const AnimatedBorderBox: React.FC<AnimatedBorderBoxProps> = ({
  children,
  ...props
}) => {
  const animationProps: MotionProps = {
    animate: {
      backgroundPosition: ["0% 0%", "100% 0%"],
      boxShadow: [
        "0 0 20px rgba(158,102,239,0.5), 0 0 30px rgba(247,191,87,0.5), 0 0 40px rgba(247,93,88,0.5)",
        "0 0 30px rgba(158,102,239,0.7), 0 0 40px rgba(247,191,87,0.7), 0 0 50px rgba(247,93,88,0.7)",
        "0 0 20px rgba(158,102,239,0.5), 0 0 30px rgba(247,191,87,0.5), 0 0 40px rgba(247,93,88,0.5)",
      ],
    },
    transition: {
      backgroundPosition: {
        repeat: Infinity,
        duration: 8,
        ease: "linear",
      },
      boxShadow: {
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut",
      },
    },
  };

  return (
    <Box position="relative" {...props}>
      <MotionBox
        position="absolute"
        top="-3px"
        left="-3px"
        right="-3px"
        bottom="-3px"
        borderRadius="lg"
        background="linear-gradient(90deg, 
          #9E66EF 0%,
          #F7BF57 33.33%,
          #F75D58 66.66%,
          #9E66EF 100%)"
        backgroundSize="300% 100%"
        filter="brightness(1.2) contrast(1.1)"
        {...animationProps}
      />
      <Box
        position="relative"
        bg="rgba(0,0,0,0.85)"
        borderRadius="lg"
        zIndex={1}
        overflow="hidden"
        m="3px"
        boxShadow="inset 0 0 15px rgba(158,102,239,0.3), inset 0 0 15px rgba(247,191,87,0.3), inset 0 0 15px rgba(247,93,88,0.3)"
      >
        {children}
      </Box>
    </Box>
  );
};

export default AnimatedBorderBox;
