"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Upload, FileText, ChevronsUpDown, Clock } from "lucide-react";

export default function ScheduleForm({ newService, setNewService }) {
  const handleScheduleChange = (dayIdx, value) => {
    const updated = [...newService.schedule];
    updated[dayIdx].available = value;
    if (!value) updated[dayIdx].times = [];
    setNewService({ ...newService, schedule: updated });
  };

  const addTimeSlot = (dayIdx) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times.push("");
    setNewService({ ...newService, schedule: updated });
  };

  const removeTimeSlot = (dayIdx, timeIdx) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times.splice(timeIdx, 1);
    setNewService({ ...newService, schedule: updated });
  };

  const handleTimeChange = (dayIdx, timeIdx, value) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times[timeIdx] = value;
    setNewService({ ...newService, schedule: updated });
  };

  return (
    <div className="space-y-4">
                  <h3 className="font-semibold text-green-800 border-b border-green-100 pb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Weekly Schedule
                  </h3>
                  <div className="space-y-3">
                    {newService.schedule.map((daySlot, dayIdx) => (
                      <div
                        key={daySlot.day}
                        className="border border-green-200 rounded-lg p-4 bg-white hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={daySlot.available}
                              onChange={(e) =>
                                handleScheduleChange(dayIdx, e.target.checked)
                              }
                              className="w-4 h-4 accent-green-600"
                            />
                            <span className="font-medium text-green-800">
                              {daySlot.day}
                            </span>
                          </div>
                          {daySlot.available && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTimeSlot(dayIdx)}
                              className="text-green-600 border-green-300 hover:bg-green-100"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Time
                            </Button>
                          )}
                        </div>
                        {daySlot.available && (
                          <div className="space-y-2 ml-7">
                            {daySlot.times.length === 0 ? (
                              <p className="text-sm text-green-600 italic">
                                No time slots added yet
                              </p>
                            ) : (
                              daySlot.times.map((timeRange, timeIdx) => {
                                const [startTime = "", endTime = ""] =
                                  timeRange.split(" - ");
                                return (
                                  <div
                                    key={timeIdx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      type="time"
                                      className="border-green-200 focus:border-green-500 text-sm"
                                      value={startTime}
                                      onChange={(e) => {
                                        const newStart = e.target.value;
                                        handleTimeChange(
                                          dayIdx,
                                          timeIdx,
                                          `${newStart} - ${endTime}`
                                        );
                                      }}
                                    />
                                    <span className="text-green-600">to</span>
                                    <Input
                                      type="time"
                                      className="border-green-200 focus:border-green-500 text-sm"
                                      value={endTime}
                                      onChange={(e) => {
                                        const newEnd = e.target.value;
                                        handleTimeChange(
                                          dayIdx,
                                          timeIdx,
                                          `${startTime} - ${newEnd}`
                                        );
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeTimeSlot(dayIdx, timeIdx)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
  );
}
