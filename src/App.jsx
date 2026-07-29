const [unlocked, setUnlocked] = useState(false);
const [pin, setPin] = useState("");
const [savedPin, setSavedPin] = useState(localStorage.getItem("parentPin") || "");
const [creating, setCreating] = useState(localStorage.getItem("parentPin") === null);
const [confirmPin, setConfirmPin] = useState("");
