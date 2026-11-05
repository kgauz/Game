import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Globe,
    LogOut,
    Shield,
    Users,
    ArrowRight,
    RefreshCw
} from "lucide-react";

import api from "../services/api";

function NewGame() {
    const navigate = useNavigate();

    const [countries, setCountries] = useState([]);
    const [selected, setSelected] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const loadCountries = async () => {
        setBusy(true);
        setMessage("");

        try {
            const { data } = await api.post("/games/new");

            setCountries(data.countries || []);
            setGameId(data._id);
            setSelected(null);

            localStorage.setItem("gameId", data._id);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Unable to generate countries."
            );
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        loadCountries();
    }, []);

    const startCampaign = async () => {
        if (busy) return;

        if (!selected) {
            setMessage("Please select a country.");
            return;
        }

        if (!gameId) {
            setMessage("No campaign available. Generate a new one.");
            return;
        }

        setBusy(true);
        setMessage("");

        try {
            const { data } = await api.post(`/games/${gameId}/start`, {
                selectedCountry: selected
            });

            const gameIdFromResponse = data._id || data.game?._id;

            if (!gameIdFromResponse) {
                throw new Error("Game ID was not returned.");
            }

            localStorage.setItem("gameId", gameIdFromResponse);

            navigate(`/game/${gameIdFromResponse}`);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                error.message ||
                "Unable to start the campaign."
            );
        } finally {
            setBusy(false);
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="setup-page">
            <header className="setup-header">
                <div className="brand">
                    GEO<span>POLITICS</span>
                </div>

                <button
                    className="icon-btn"
                    onClick={logout}
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </header>

            <main className="setup-content">
                <div className="setup-heading">
                    <p className="eyebrow">CAMPAIGN CONFIGURATION</p>

                    <h1>Choose your nation</h1>

                    <p>
                        Pick your starting nation from the full list.
                        Nine other countries will be selected at random
                        to join the campaign.
                    </p>
                </div>

                <div className="setup-info">
                    <div>
                        <Globe size={20} />
                        <span>10 COUNTRIES</span>
                    </div>

                    <div>
                        <Users size={20} />
                        <span>9 NPC FACTIONS</span>
                    </div>

                    <div>
                        <Shield size={20} />
                        <span>POPULATION-BASED FORCES</span>
                    </div>
                </div>

                {busy && countries.length === 0 && (
                    <div className="loading-screen">
                        GENERATING CAMPAIGN...
                    </div>
                )}

                <div className="country-selection">
                    {countries.map((country, index) => (
                        <button
                            key={country.name}
                            className={`selection-card ${
                                selected === country.name ? "active" : ""
                            }`}
                            onClick={() => setSelected(country.name)}
                            disabled={busy}
                        >
                            <span className="selection-index">
                                {String(index + 1).padStart(2, "0")}
                            </span>

                            <div>
                                <h3>{country.name}</h3>

                                <p>
                                    Population:{" "}
                                    {(country.population || 0).toLocaleString()}
                                </p>
                            </div>

                            <div className="selection-soldiers">
                                <Shield size={16} />
                                <strong>
                                    {country.soldiers ?? country.soldierValue ?? 0}
                                </strong>
                                <small>SOLDIERS</small>
                            </div>

                            {selected === country.name && (
                                <span className="selected-indicator">
                                    SELECTED
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {message && (
                    <div className="form-message error">
                        {message}
                    </div>
                )}

                <div className="setup-actions">
                    <button
                        className="secondary-btn"
                        onClick={loadCountries}
                        disabled={busy}
                    >
                        <RefreshCw size={17} />
                        GENERATE AGAIN
                    </button>

                    <button
                        className="primary-btn setup-start"
                        onClick={startCampaign}
                        disabled={!selected || busy || !gameId}
                    >
                        START CAMPAIGN
                        <ArrowRight size={18} />
                    </button>
                </div>
            </main>
        </div>
    );
}

export default NewGame;