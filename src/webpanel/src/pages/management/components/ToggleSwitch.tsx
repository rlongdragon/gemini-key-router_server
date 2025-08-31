import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
}

export default function ToggleSwitch({
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center">
      <span
        className={`mr-2 text-sm font-medium ${
          !checked ? "text-white" : "text-gray-400"
        }`}
      >
        禁用
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      </label>
      <span
        className={`ml-2 text-sm font-medium ${
          checked ? "text-white" : "text-gray-400"
        }`}
      >
        啟用
      </span>
    </div>
  );
}