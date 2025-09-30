import { useEffect, useState } from "react";

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = `toggle-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between cursor-pointer"
    >
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-colors ${
            checked ? "bg-indigo-500" : "bg-slate-600"
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? "transform translate-x-6" : ""
          }`}
        ></div>
      </div>
    </label>
  );
}

export default function App() {
  const [delay, setDelay] = useState<number>(10);
  const [useMathChallenge, setUseMathChallenge] = useState<boolean>(true);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get(["spamSettings"], (result) => {
      if (result.spamSettings) {
        setDelay(result.spamSettings.delay || 10);
        setUseMathChallenge(result.spamSettings.useMathChallenge !== false);
      }
    });
  }, []);

  const handleSave = async () => {
    const newSettings = { delay, useMathChallenge };
    await chrome.storage.local.set({ spamSettings: newSettings });

    chrome.runtime.sendMessage({ command: "SETTINGS_UPDATED" });

    setStatus("Settings saved successfully!");
    setTimeout(() => setStatus(""), 2000);

    // Restart the extension and reload the page
    chrome.runtime.reload();
    window.location.reload();
  };

  return (
    <div className="p-6 min-w-[400px] bg-gradient-to-br from-slate-900 to-indigo-900 font-sans">
      <h1 className="text-2xl font-bold text-center text-white drop-shadow-lg mb-4">
        DeRot Settings
      </h1>

      <div className="flex flex-col gap-6 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl">
        {/* <div className="flex flex-col gap-2">
          <label htmlFor="delay" className="text-sm font-medium text-slate-300">
            Delay before starting spam (seconds):
          </label>
          <input
            id="delay"
            type="number"
            min="0"
            max="300"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div> */}
        <ToggleSwitch
          label={useMathChallenge ? "Math Challenge Mode" : "Emoji Spam Mode"}
          checked={useMathChallenge}
          onChange={setUseMathChallenge}
        />{" "}
        <div className="mt-2">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Save Settings
          </button>

          {status && (
            <div className="mt-4 text-center text-green-400 text-sm transition-opacity duration-300">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
