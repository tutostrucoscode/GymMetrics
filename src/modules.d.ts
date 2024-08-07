declare module "*.svg?r" {
  import React from "react";
  const Svg: React.FC<React.ComponentProps<"svg"> & { title?: string }>;
  export default Svg;
}
