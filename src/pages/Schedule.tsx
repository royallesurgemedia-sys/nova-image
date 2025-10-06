import { ScheduleManager } from "@/components/ScheduleManager";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Schedule = () => {
  const location = useLocation();
  const [prefilledImage, setPrefilledImage] = useState("");
  const [prefilledPrompt, setPrefilledPrompt] = useState("");

  useEffect(() => {
    if (location.state?.image && location.state?.imagePrompt) {
      setPrefilledImage(location.state.image);
      setPrefilledPrompt(location.state.imagePrompt);
    }
  }, [location.state]);

  return (
    <div className="max-w-4xl mx-auto">
      <ScheduleManager 
        prefilledImage={prefilledImage}
        prefilledPrompt={prefilledPrompt}
        onClearPrefilled={() => {
          setPrefilledImage("");
          setPrefilledPrompt("");
        }}
      />
    </div>
  );
};

export default Schedule;
