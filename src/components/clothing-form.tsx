import {
  CATEGORIES,
  FORMALITY_LEVELS,
  WARMTH_LEVELS,
  type Category,
  type Formality,
  type Warmth,
} from "@/lib/clothing";
import { FlashMessage } from "@/components/flash-message";

interface ClothingFormProps {
  action: string;
  submitLabel: string;
  requirePhoto: boolean;
  defaultValues?: {
    name: string;
    brand: string;
    subtype: string;
    category: Category;
    colors: string;
    material: string;
    warmth: Warmth;
    formality: Formality;
    notes: string;
  };
  error?: string;
  message?: string;
}

type ClothingFormDefaults = NonNullable<ClothingFormProps["defaultValues"]>;

const EMPTY_DEFAULTS: ClothingFormDefaults = {
  name: "",
  brand: "",
  subtype: "",
  category: "top",
  colors: "",
  material: "",
  warmth: "medium",
  formality: "casual",
  notes: "",
};

export function ClothingForm({
  action,
  submitLabel,
  requirePhoto,
  defaultValues = EMPTY_DEFAULTS,
  error,
  message,
}: ClothingFormProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <FlashMessage error={error} message={message} />
      <form action={action} method="post" encType="multipart/form-data" className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={defaultValues.name}
              placeholder="White Everyday Tee"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="brand">
              Brand (optional)
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              defaultValue={defaultValues.brand}
              placeholder="Uniqlo"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="subtype">
            Subtype (optional)
          </label>
          <input
            id="subtype"
            name="subtype"
            type="text"
            defaultValue={defaultValues.subtype}
            placeholder="hoodie, quarter zip, chinos"
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="photo">
            Photo
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            required={requirePhoto}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={defaultValues.category}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="colors">
              Colors (comma-separated)
            </label>
            <input
              id="colors"
              name="colors"
              type="text"
              required
              defaultValue={defaultValues.colors}
              placeholder="black, white"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="material">
              Material (optional)
            </label>
            <input
              id="material"
              name="material"
              type="text"
              defaultValue={defaultValues.material}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="warmth">
              Warmth
            </label>
            <select
              id="warmth"
              name="warmth"
              defaultValue={defaultValues.warmth}
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {WARMTH_LEVELS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="formality">
            Formality
          </label>
          <select
            id="formality"
            name="formality"
            defaultValue={defaultValues.formality}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {FORMALITY_LEVELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={defaultValues.notes}
            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
