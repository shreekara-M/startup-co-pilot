import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../common/Input";
import Button from "../common/Button";
import { upsertDetails } from "../../api/ideas.api";

// ─── Startup Details Form ───────────────────────────────
//
// 9-field form that creates or updates startup details (upsert).
// Fields: problem, solution, targetAudience, uniqueValue,
//         revenueModel, marketSize, competitors[], teamNeeds[], budget
//
// competitors and teamNeeds are dynamic string arrays —
// user can add/remove items with + and X buttons.
//
// On save: PUT /ideas/:id/details → calls onSaved callback

export default function DetailsForm({ ideaId, existingDetails, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [teamNeeds, setTeamNeeds] = useState([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [teamNeedInput, setTeamNeedInput] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  // Populate form when existingDetails loads
  useEffect(() => {
    if (existingDetails) {
      reset({
        problem: existingDetails.problem || "",
        solution: existingDetails.solution || "",
        targetAudience: existingDetails.targetAudience || "",
        uniqueValue: existingDetails.uniqueValue || "",
        revenueModel: existingDetails.revenueModel || "",
        marketSize: existingDetails.marketSize || "",
        budget: existingDetails.budget ?? "",
      });
      setCompetitors(existingDetails.competitors || []);
      setTeamNeeds(existingDetails.teamNeeds || []);
    }
  }, [existingDetails, reset]);

  // ─── Array field handlers ───────────────────────────

  const addCompetitor = () => {
    const val = competitorInput.trim();
    if (val && !competitors.includes(val)) {
      setCompetitors([...competitors, val]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (index) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const addTeamNeed = () => {
    const val = teamNeedInput.trim();
    if (val && !teamNeeds.includes(val)) {
      setTeamNeeds([...teamNeeds, val]);
      setTeamNeedInput("");
    }
  };

  const removeTeamNeed = (index) => {
    setTeamNeeds(teamNeeds.filter((_, i) => i !== index));
  };

  // Handle Enter key in array inputs
  const handleKeyDown = (e, addFn) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFn();
    }
  };

  // ─── Submit ─────────────────────────────────────────

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        problem: data.problem || undefined,
        solution: data.solution || undefined,
        targetAudience: data.targetAudience || undefined,
        uniqueValue: data.uniqueValue || undefined,
        revenueModel: data.revenueModel || undefined,
        marketSize: data.marketSize || undefined,
        budget: data.budget ? parseFloat(data.budget) : undefined,
        competitors,
        teamNeeds,
      };

      const saved = await upsertDetails(ideaId, payload);
      toast.success("Details saved!");
      if (onSaved) onSaved(saved);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to save details";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ─── Section: Problem & Solution ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Problem & Solution
        </h3>
        <div className="space-y-4">
          <TextArea
            label="What problem does your startup solve?"
            placeholder="Describe the pain point your target users face..."
            error={errors.problem?.message}
            {...register("problem")}
          />
          <TextArea
            label="How does your startup solve it?"
            placeholder="Describe your solution and how it addresses the problem..."
            error={errors.solution?.message}
            {...register("solution")}
          />
        </div>
      </div>

      {/* ─── Section: Market ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Market & Audience
        </h3>
        <div className="space-y-4">
          <Input
            label="Target Audience"
            placeholder="e.g. Pet owners aged 25-45 in urban areas"
            error={errors.targetAudience?.message}
            {...register("targetAudience")}
          />
          <Input
            label="Unique Value Proposition"
            placeholder="What makes you different from existing solutions?"
            error={errors.uniqueValue?.message}
            {...register("uniqueValue")}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Market Size"
              placeholder="e.g. $5.2 billion pet tech market"
              error={errors.marketSize?.message}
              {...register("marketSize", { maxLength: { value: 100, message: "Max 100 characters" } })}
            />
            <Input
              label="Revenue Model"
              placeholder="e.g. Freemium with $9.99/month premium"
              error={errors.revenueModel?.message}
              {...register("revenueModel", { maxLength: { value: 100, message: "Max 100 characters" } })}
            />
          </div>
        </div>
      </div>

      {/* ─── Section: Competitors ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Competitors
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, addCompetitor)}
            placeholder="Add a competitor name..."
            className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                       placeholder:text-gray-400 focus:outline-none focus:ring-2
                       focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <Button type="button" variant="secondary" onClick={addCompetitor}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        {competitors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {competitors.map((name, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           bg-gray-100 text-sm text-gray-700"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeCompetitor(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {competitors.length === 0 && (
          <p className="text-xs text-gray-400">No competitors added yet</p>
        )}
      </div>

      {/* ─── Section: Team & Budget ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Team & Budget
        </h3>

        {/* Team needs array */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Team Needs
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={teamNeedInput}
              onChange={(e) => setTeamNeedInput(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addTeamNeed)}
              placeholder="e.g. React developer, UX designer..."
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm
                         placeholder:text-gray-400 focus:outline-none focus:ring-2
                         focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <Button type="button" variant="secondary" onClick={addTeamNeed}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
          {teamNeeds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {teamNeeds.map((need, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-blue-50 text-sm text-blue-700"
                >
                  {need}
                  <button
                    type="button"
                    onClick={() => removeTeamNeed(i)}
                    className="text-blue-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {teamNeeds.length === 0 && (
            <p className="text-xs text-gray-400">No team needs added yet</p>
          )}
        </div>

        {/* Budget */}
        <Input
          label="Estimated Budget ($)"
          type="number"
          placeholder="e.g. 50000"
          error={errors.budget?.message}
          {...register("budget", {
            min: { value: 0, message: "Budget cannot be negative" },
          })}
        />
      </div>

      {/* ─── Save Button ─── */}
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" />
          Save Details
        </Button>
      </div>
    </form>
  );
}

// ─── TextArea sub-component ─────────────────────────────
// Textarea with label and error, matching Input component styling.

import { forwardRef } from "react";

const TextArea = forwardRef(function TextArea(
  { label, error, placeholder, ...props },
  ref
) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={3}
        placeholder={placeholder}
        className={`
          w-full px-3.5 py-2.5 rounded-lg border text-sm resize-none
          transition-colors duration-200 placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
});
