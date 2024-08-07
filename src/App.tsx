import { CSSReset, ChakraProvider } from "@chakra-ui/react";
import AppRouters from "./features/routers";

const App = () => {
  return (
    <ChakraProvider>
      <CSSReset />
      <AppRouters />
    </ChakraProvider>
  );
};

export default App;
