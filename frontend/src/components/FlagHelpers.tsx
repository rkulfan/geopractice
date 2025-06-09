interface CategoryDropdownProps {
  selected: string;
  onChange: (value: string) => void;
}

const categories = [
  { code: "countries", name: "Countries" },
  { code: "territories", name: "Territories" },
  { code: "us-states", name: "US States" },
  { code: "uk-countries", name: "UK Countries" },
  { code: "all", name: "All" }
];

export function CountryDropdown({ selected, onChange }: CategoryDropdownProps) {
  return (
    <select value={selected} onChange={(e) => onChange(e.target.value)}>
      {categories.map(({ code, name }) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}
