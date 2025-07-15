export interface CategoryOption {
  value: string;
  name: string;
  tag: string;
}

export interface ModeOption {
  value: string;
  name: string;
}

export interface PracticeOption {
  value: number;
  name: string;
}

interface CategoryDropdownProps {
  selected: CategoryOption;
  onChange: (value: CategoryOption) => void;
}

interface ModeDropdownProps {
  selected: ModeOption;
  onChange: (value: ModeOption) => void;
}

interface PracticeDropdownProps {
  selected: PracticeOption;
  onChange: (value: PracticeOption) => void;
}

const categoryOptions: CategoryOption[] = [
  { value: 'countries', name: 'Countries', tag: "country's" },
  { value: 'territories', name: 'Territories', tag: "territory's" },
  { value: 'us-states', name: 'US States', tag: "US state's" },
  { value: 'uk-countries', name: 'UK Countries', tag: "UK country's" },
  { value: 'all', name: 'All', tag: '' }
];

const modeOptions: ModeOption[] = [
  { value: 'typed', name: "Typed" },
  { value: 'multiplechoice', name: "Multiple Choice" }
];

const practiceOptions: PracticeOption[] = [
  { value: 1, name: "Practice" },
  { value: 0, name: "Normal" }
];

export function CategoryDropdown({ selected, onChange }: CategoryDropdownProps) {
  return (
    <select
      value={selected.value}
      onChange={(e) => {
        const selectedOption = categoryOptions.find(opt => opt.value === e.target.value);
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      {categoryOptions.map(({ value, name }) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}

export function ModeDropdown({ selected, onChange }: ModeDropdownProps) {
  return (
    <select
      value={selected.value}
      onChange={(e) => {
        const selectedOption = modeOptions.find(opt => opt.value === e.target.value);
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      {modeOptions.map(({ value, name }) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}

export function PracticeDropdown({ selected, onChange }: PracticeDropdownProps) {
  return (
    <select
      value={selected.value}
      onChange={(e) => {
        const selectedOption = practiceOptions.find(opt => opt.value === Number(e.target.value));
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      {practiceOptions.map(({ value, name }) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}