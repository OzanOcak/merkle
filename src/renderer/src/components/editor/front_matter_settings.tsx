import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface FrontMatterKey {
  key: string;
  value: string;
}

interface FrontMatterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFrontMatter: (frontMatter: string) => void;
}

export const FrontMatterSettings = ({
  isOpen,
  onClose,
  onInsertFrontMatter,
}: FrontMatterSettingsProps) => {
  const [frontMatterKeys, setFrontMatterKeys] = useState<FrontMatterKey[]>([]);
  const [newKey, setNewKey] = useState("");

  // Load keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem("frontMatterKeys");
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        if (Array.isArray(parsed)) {
          setFrontMatterKeys(parsed);
        }
      } catch (e) {
        console.error("Error loading saved keys:", e);
      }
    }
  }, []);

  const normalizeKey = (key: string) => key.trim().toLowerCase();

  const addNewKey = () => {
    const trimmedKey = newKey.trim();
    if (
      trimmedKey &&
      !frontMatterKeys.some(
        (k) => normalizeKey(k.key) === normalizeKey(trimmedKey)
      )
    ) {
      const updatedKeys = [...frontMatterKeys, { key: trimmedKey, value: "" }];
      setFrontMatterKeys(updatedKeys);
      localStorage.setItem("frontMatterKeys", JSON.stringify(updatedKeys));
      setNewKey("");
    }
  };

  const updateKeyValue = (key: string, newValue: string) => {
    const updatedKeys = frontMatterKeys.map((item) =>
      item.key === key ? { ...item, value: newValue } : item
    );
    setFrontMatterKeys(updatedKeys);
    localStorage.setItem("frontMatterKeys", JSON.stringify(updatedKeys));
  };

  const removeKey = (keyToRemove: string) => {
    const updatedKeys = frontMatterKeys.filter(
      (item) => item.key !== keyToRemove
    );
    setFrontMatterKeys(updatedKeys);
    localStorage.setItem("frontMatterKeys", JSON.stringify(updatedKeys));
  };

  const handleInsert = () => {
    let frontMatter = "---\n";
    frontMatterKeys.forEach(({ key, value }) => {
      const isDate = normalizeKey(key) === "date";
      const finalValue = isDate
        ? new Date()
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })
            .replace(/\//g, ".")
        : value;
      frontMatter += `${key}: ${finalValue}\n`;
    });
    frontMatter += "---\n\n";
    onInsertFrontMatter(frontMatter);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Front Matter Settings
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 dark:text-gray-300">
            Add New Field
          </label>
          <div className="flex">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Field name"
              className="flex-1 border rounded-l px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && addNewKey()}
            />
            <button
              onClick={addNewKey}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-r"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border rounded divide-y dark:border-gray-600 max-h-60 overflow-y-auto mb-4">
          {frontMatterKeys.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium dark:text-gray-300">{item.key}</div>

                {normalizeKey(item.key) === "date" ? (
                  <div className="text-sm text-blue-500 dark:text-blue-400 mt-1">
                    Will auto-generate: {new Date().toLocaleDateString()}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateKeyValue(item.key, e.target.value)}
                    className="w-full mt-1 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter value"
                  />
                )}
              </div>

              <button
                onClick={() => removeKey(item.key)}
                className="ml-2 mt-8 text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Insert Front Matter
          </button>
        </div>
      </div>
    </div>
  );
};
