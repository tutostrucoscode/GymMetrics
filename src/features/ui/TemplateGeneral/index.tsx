import React from "react";
import { useNavigate } from "react-router-dom";
import { Ico } from "@/assets/icons";
import {
  Avatar,
  Box,
  Container,
  HStack,
  IconButton,
  useBreakpointValue,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks/hooks";
import { startLogout } from "@/redux/actions/auth";
import { Path } from "@/constants";

interface TemplateGeneralProps {
  children: React.ReactNode;
}

const TemplateGeneral: React.FC<TemplateGeneralProps> = ({ children }) => {
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { name, email, urlimage } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(startLogout());
    navigate(Path.Auth);
  };

  const handleLogoClick = () => {
    if (email) {
      navigate(Path.Dashboard);
    } else {
      navigate(Path.Index);
    }
  };

  return (
    <Box minH={"32rem"}>
      <Box
        borderBottomWidth={"1px"}
        bg={"gray.100"}
        pos={"relative"}
        zIndex={1800}
      >
        <Container maxW="7xl">
          <HStack justify={"space-between"} py={2}>
            <IconButton
              hidden={!isMobile}
              variant="outline"
              colorScheme="teal"
              aria-label="Open menu"
              icon={<Ico.Menu />}
            />

            {/* Clickable, non-selectable Logo */}
            <Text
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
              flex={1}
              cursor="pointer"
              userSelect="none"
              onClick={handleLogoClick}
            >
              GymMetrics
            </Text>

            {/* User Menu */}
            {email ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={"full"}
                  variant={"link"}
                  cursor={"pointer"}
                  minW={0}
                >
                  <Avatar
                    size="sm"
                    name={name || undefined}
                    src={urlimage || undefined}
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                onClick={() => navigate(Path.Auth)}
                colorScheme="teal"
                size="sm"
              >
                Login
              </Button>
            )}
          </HStack>
        </Container>
      </Box>
      <Container maxW="7xl" my={10}>
        {children}
      </Container>
    </Box>
  );
};

export default TemplateGeneral;
