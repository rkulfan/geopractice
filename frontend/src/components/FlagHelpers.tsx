export interface CategoryOption {
  value: string;
  name: string;
  tag: string;
}

interface CategoryDropdownProps {
  selected: CategoryOption;
  onChange: (value: CategoryOption) => void;
}

const options: CategoryOption[] = [
  { value: 'countries', name: 'Countries', tag: "country's" },
  { value: 'territories', name: 'Territories', tag: "territory's" },
  { value: 'us-states', name: 'US States', tag: "US state's" },
  { value: 'uk-countries', name: 'UK Countries', tag: "UK country's" },
  { value: 'all', name: 'All', tag: '' }
];

export function CountryDropdown({ selected, onChange }: CategoryDropdownProps) {
  return (
    <select
      value={selected.value}
      onChange={(e) => {
        const selectedOption = options.find(opt => opt.value === e.target.value);
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      {options.map(({ value, name }) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}

