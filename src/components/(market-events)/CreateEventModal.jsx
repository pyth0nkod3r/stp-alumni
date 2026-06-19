import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import eventService from "@/lib/services/eventService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

const timezones = [
  "(UTC-12:00) International Date Line West",
  "(UTC-08:00) Pacific Time (US & Canada)",
  "(UTC-05:00) Eastern Time (US & Canada)",
  "(UTC+00:00) London, Dublin, Lisbon",
  "(UTC+01:00) West Central Africa",
  "(UTC+03:00) Nairobi, East Africa",
];

const eventFormats = ["Live Link", "External Event Link"];

export function CreateEventModal({ open, onOpenChange }) {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Initialize React Hook Form
  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      isOnline: true,
      isInPerson: false,
      eventFormat: "",
      eventName: "",
      timezone: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      address: "",
      venue: "",
      eventLink: "",
      description: "",
      coverImage: null,
    },
  });

  const isOnline = watch("isOnline");
  const isInPerson = watch("isInPerson");
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: eventService.createEvent,
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onOpenChange(false);
      reset();
      setPreviewImage(null);
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      toast.error(error.response?.data?.message || "Failed to create event. Please try again.");
    },
  });


  const onSubmit = (data) => {
    if (!data.isOnline && !data.isInPerson) {
      toast.error("At least one event type must be selected.");
      return;
    }

    if (
      !data.eventName ||
      !data.startDate ||
      !data.startTime ||
      !data.endDate ||
      !data.endTime
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const finalEventType = data.isOnline && data.isInPerson ? "hybrid" : data.isOnline ? "online" : "in-person";
    const formData = new FormData();
    formData.append("type", finalEventType);
    formData.append("format", data.eventFormat || "json");
    formData.append("name", data.eventName);
    formData.append("timeZone", data.timezone);

    // Combine date and time to proper ISO strings
    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}:00`).toISOString();
      formData.append("startTime", startDateTime);

      const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`).toISOString();
      formData.append("endTime", endDateTime);
    } catch (err) {
      toast.error("Invalid date or time format selected.");
      return;
    }

    formData.append("description", data.description);

    if (data.eventLink) {
      formData.append("externalLink", data.eventLink);
    }

    if (finalEventType === "in-person" || finalEventType === "hybrid") {
      formData.append("address", data.address);
      formData.append("venue", data.venue);
    }

    if (data.coverImage) {
      formData.append("coverImage", data.coverImage);
    }

    createEventMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return alert("Images only");
      if (file.size > 5 * 1024 * 1024) return alert("Max 5MB");

      // Update React Hook Form state
      setValue("coverImage", file);

      // Create local preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("coverImage", null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create an event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          {/* Cover Image Upload */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {previewImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={previewImage}
                  className="w-full h-40 object-cover"
                  alt="Preview"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50"
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Upload a cover image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum width 480 pixels, 16:9 recommended
                </p>
              </div>
            )}
          </div>

          {/* Event Type (Checkboxes) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Event type</Label>
            <div className="flex gap-6 pt-1">
              <div className="flex items-center space-x-2">
                <Controller
                  name="isOnline"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="online"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        // Prevent unchecking both
                        if (!checked && !isInPerson) {
                          return;
                        }
                        field.onChange(checked);
                      }}
                    />
                  )}
                />
                <Label htmlFor="online" className="text-sm font-medium cursor-pointer">Online</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="isInPerson"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="in-person"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        // Prevent unchecking both
                        if (!checked && !isOnline) {
                          return;
                        }
                        field.onChange(checked);
                      }}
                    />
                  )}
                />
                <Label htmlFor="in-person" className="text-sm font-medium cursor-pointer">In person</Label>
              </div>
            </div>
          </div>

          {/* Event Format (Select) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Event format
            </Label>
            <Controller
              name="eventFormat"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventFormats.map((f) => (
                      <SelectItem
                        key={f}
                        value={f.toLowerCase().replace(/\s+/g, "-")}
                      >
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Event Name (Standard Input) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Event name</Label>
            <Input {...register("eventName")} placeholder="Enter event name" />
          </div>

          {/* Timezone (Select) */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Timezone</Label>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Start date
              </Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Start time
              </Label>
              <Input type="time" {...register("startTime")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End date</Label>
              <Input type="date" {...register("endDate")} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">End time</Label>
              <Input type="time" {...register("endTime")} />
            </div>
          </div>
          {isInPerson && (
            <>
              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Address</Label>
                <Input {...register("address")} rows={4} />
              </div>
              {/* Venue */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Venue</Label>
                <Input {...register("venue")} rows={4} />
              </div>
            </>
          )}

          {/* External Event Link */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              External Event Link
            </Label>
            <Input {...register("eventLink")} rows={4} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createEventMutation.isPending}>
            {createEventMutation.isPending ? "Creating..." : "Next"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
