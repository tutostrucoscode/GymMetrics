import React from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { Button, VStack, HStack, Text } from "@chakra-ui/react";
import {
  Select,
  CreatableSelect,
  ChakraStylesConfig,
  GroupBase,
} from "chakra-react-select";

interface Option {
  value: string;
  label: string;
}

interface DynamicSelectProps {
  title: string;
  options: Option[];
  allowEmpty: boolean;
  isSearchable: boolean;
  onChange: (values: string[]) => void;
}

const DynamicSelect: React.FC<DynamicSelectProps> = ({
  title,
  options,
  allowEmpty,
  isSearchable,
  onChange,
}) => {
  const { control, handleSubmit } = useForm<{ selects: { value: string }[] }>({
    defaultValues: {
      selects: allowEmpty ? [] : [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "selects",
  });

  const onSubmit = handleSubmit((data) => {
    onChange(data.selects.map((select) => select.value));
  });

  const SelectComponent = isSearchable ? CreatableSelect : Select;

  const chakraStyles: ChakraStylesConfig<Option, false, GroupBase<Option>> = {
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
  };

  return (
    <VStack align="stretch" spacing={4} onBlur={onSubmit}>
      <Text fontWeight="bold">{title}</Text>
      {fields.map((field, index) => (
        <HStack key={field.id}>
          <Controller
            name={`selects.${index}.value`}
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <SelectComponent<Option, false, GroupBase<Option>>
                options={options}
                onChange={(newValue: Option | null) => {
                  onChange(newValue?.value || "");
                }}
                value={options.find((option) => option.value === value) || null}
                isClearable
                isSearchable={isSearchable}
                chakraStyles={chakraStyles}
                {...rest}
              />
            )}
          />
          {(fields.length > 1 || !allowEmpty) && (
            <Button onClick={() => remove(index)}>Remove</Button>
          )}
        </HStack>
      ))}
      <Button onClick={() => append({ value: "" })}>Add</Button>
    </VStack>
  );
};

export default DynamicSelect;
