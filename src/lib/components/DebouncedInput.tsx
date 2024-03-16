import { DeleteIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import type { InputHTMLAttributes } from 'react';
import { useEffect, useState } from 'react';

export default function DebouncedInputComponent({
  value: initialValue,
  onChange,
  debounce = 250,
  placeholder,
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <InputGroup flex="1">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <InputRightElement mr="0.5rem">
        <IconButton
          h="1.75rem"
          size="sm"
          onClick={() => setValue('')}
          isRound
          variant="solid"
          aria-label="Leegmaken"
          icon={<DeleteIcon />}
        />
      </InputRightElement>
    </InputGroup>
  );
}
