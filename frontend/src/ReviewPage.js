import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Star, Upload, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MAX_PHOTO_BYTES = 350_000; // ~350KB after base64

const StarPicker = ({ value, onChange }) => (
  <div
    className="flex items-center gap-2"
    data-testid="review-rating"
    role="radiogroup"
    aria-label="Rating"
  >
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        data-testid={`review-star-${n}`}
        role="radio"
        aria-checked={value === n}
        onClick={() => onChange(n)}
        className="transition-colors"
      >
        <Star
          size={32}
          strokeWidth={1.4}
          fill={n <= value ? "#E83B22" : "transparent"}
          className={n <= value ? "text-[#E83B22]" : "text-[#D5D3CB] hover:text-[#E83B22]"}
        />
      </button>
    ))}
    <span className="ml-2 font-mono text-xs text-[#595959]">
      {value ? `${value} / 5` : "Tap to rate"}
    </span>
  </div>
);

const fileToResizedDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload an image file"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        const scale = Math.min(1, MAX / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const data = canvas.toDataURL("image/jpeg", 0.82);
        if (data.length > MAX_PHOTO_BYTES) {
          reject(new Error("Photo is too large. Try a smaller image."));
          return;
        }
        resolve(data);
      };
      img.onerror = () => reject(new Error("Couldn't read that image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Couldn't read that file"));
    reader.readAsDataURL(file);
  });

const ReviewPage = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    quote: "",
    rating: 0,
    photo_data_url: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/reviews/invite/${token}`);
        setInvite(res.data);
        setForm((f) => ({
          ...f,
          name: res.data.client_name || "",
        }));
      } catch (e) {
        setError(e?.response?.data?.detail || "This link is invalid or expired.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const data = await fileToResizedDataUrl(f);
      setForm((prev) => ({ ...prev, photo_data_url: data }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.quote || !form.rating) {
      toast.error("Name, rating, and quote are required.");
      return;
    }
    if (form.quote.length < 10) {
      toast.error("Quote should be at least 10 characters.");
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/reviews`, {
        token,
        name: form.name,
        role: form.role || null,
        company: form.company || null,
        quote: form.quote,
        rating: form.rating,
        photo_data_url: form.photo_data_url || null,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not submit. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2ED] font-mono text-sm text-[#595959]">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2ED] px-6">
        <div className="max-w-md border border-[#121212] p-10 text-center">
          <div className="overline mb-4">Review · error</div>
          <h1 className="font-display text-4xl tracking-tight leading-none">
            This link isn't valid<span className="text-[#E83B22]">.</span>
          </h1>
          <p className="mt-4 text-[#595959]">{error}</p>
          <a
            href="/"
            className="btn-ghost mt-8 inline-flex justify-center"
          >
            Go to mo home
          </a>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F2ED] px-6">
        <div className="max-w-md text-center" data-testid="review-success">
          <div className="mx-auto w-14 h-14 border border-[#121212] flex items-center justify-center">
            <Check size={22} strokeWidth={2} />
          </div>
          <h1 className="font-display text-5xl mt-6 tracking-tighter leading-none">
            Thank you<span className="text-[#E83B22]">.</span>
          </h1>
          <p className="mt-4 text-[#595959] max-w-sm mx-auto">
            I'll review it and publish to the site within a day. Hugely
            appreciated — this kind of feedback is gold.
          </p>
          <a href="/" className="btn-primary mt-10 inline-flex">Back to site</a>
        </div>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2ED] px-6 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="font-display text-2xl tracking-tighter inline-block">
          Mo<span className="text-[#E83B22]">.</span>
        </a>

        <div className="mt-10 pb-8 border-b border-[#D5D3CB]">
          <div className="overline">Review · Mo Studio</div>
          <h1 className="font-display text-5xl md:text-6xl mt-4 tracking-tighter leading-[0.95]">
            A quick favour<span className="text-[#E83B22]">.</span>
          </h1>
          <p className="mt-4 text-[#595959] max-w-lg">
            {invite?.project
              ? `Hope ${invite.project} is going well. `
              : ""}
            Rate your experience and leave a line or two — I'll publish your
            words (and photo, if you attach one) on mohamedabouzeid.com.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-10 field-line space-y-8">
          <div>
            <Label className="overline">Rating *</Label>
            <div className="mt-3">
              <StarPicker
                value={form.rating}
                onChange={(r) => setForm({ ...form, rating: r })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="overline">Name *</Label>
              <Input
                data-testid="review-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <Label className="overline">Role</Label>
              <Input
                data-testid="review-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Founder / CEO / …"
              />
            </div>
          </div>

          <div>
            <Label className="overline">Company</Label>
            <Input
              data-testid="review-company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Where you work"
            />
          </div>

          <div>
            <Label className="overline">Your review *</Label>
            <Textarea
              data-testid="review-quote"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
              rows={5}
              maxLength={500}
              placeholder="What did I get right? What did the site unlock for you?"
              required
            />
            <div className="text-right text-xs font-mono text-[#595959] mt-1">
              {form.quote.length} / 500
            </div>
          </div>

          <div>
            <Label className="overline">Photo (optional)</Label>
            <div className="mt-3 flex items-center gap-4">
              {form.photo_data_url ? (
                <div className="relative">
                  <img
                    src={form.photo_data_url}
                    alt="preview"
                    data-testid="review-photo-preview"
                    className="w-20 h-20 object-cover border border-[#121212] grayscale"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photo_data_url: "" })}
                    data-testid="review-photo-remove"
                    className="absolute -top-2 -right-2 bg-[#121212] text-[#F3F2ED] w-6 h-6 flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  data-testid="review-photo-upload"
                  className="w-20 h-20 border border-dashed border-[#121212] flex items-center justify-center hover:bg-[#EAE9E4] transition-colors"
                  aria-label="Upload photo"
                >
                  <Upload size={18} strokeWidth={1.5} />
                </button>
              )}
              <div className="text-xs text-[#595959] font-mono">
                JPG / PNG · resized automatically<br />
                will appear grayscale on the site
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFile}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#D5D3CB] flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs font-mono text-[#595959] max-w-sm">
              By submitting, you allow Mo to publish this review on
              mohamedabouzeid.com. No other use, ever.
            </p>
            <button
              type="submit"
              disabled={saving}
              data-testid="review-submit"
              className="btn-primary"
            >
              {saving ? "Sending…" : "Submit review →"}
            </button>
          </div>
        </form>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default ReviewPage;
