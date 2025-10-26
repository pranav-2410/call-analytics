import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  YAxis
} from "recharts";
import { supabase } from "../lib/supabase";
import { ChartPoint, UserChartRow } from "../types";

type Props = {
  email: string;
};

const defaultChartKey = "agent_calls_last_7_days";

const defaultData: ChartPoint[] = [
  { name: "Mon", calls: 120 },
  { name: "Tue", calls: 210 },
  { name: "Wed", calls: 180 },
  { name: "Thu", calls: 240 },
  { name: "Fri", calls: 200 },
  { name: "Sat", calls: 160 },
  { name: "Sun", calls: 90 }
];

export default function Dashboard({ email }: Props) {
  const [data, setData] = useState<ChartPoint[]>(defaultData);
  const [loading, setLoading] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [existingRow, setExistingRow] = useState<UserChartRow | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<string>("");

  useEffect(() => { fetchExisting(); /* eslint-disable-next-line */ }, [email]);

  const fetchExisting = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("user_chart_values")
      .select("*")
      .eq("email", email)
      .eq("chart_key", defaultChartKey)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(error);
    } else if (rows) {
      setHasExisting(true);
      setExistingRow(rows as UserChartRow);
      try {
        const parsed = (rows as any).chart_data;
        if (parsed && Array.isArray(parsed)) {
          setData(parsed);
        }
      } catch (err) {
        console.warn("failed parse", err);
      }
    } else {
      setHasExisting(false);
      setExistingRow(null);
      setData(defaultData);
    }
    setLoading(false);
  };

  const onUseExisting = () => {
    if (existingRow) {
      setData(existingRow.chart_data);
    }
  };

  const onSave = async () => {
    setLoading(true);
    const payload = {
      email,
      chart_key: defaultChartKey,
      chart_data: data
    };

    const { error } = await supabase.from("user_chart_values").upsert(payload, {
      onConflict:  "email,chart_key"
    });

    if (error) {
      console.error(error);
      alert("Save failed. Check console.");
    } else {
      alert("Saved!");
      fetchExisting();
    }
    setLoading(false);
  };

  const onStartEdit = (idx: number) => {
    setEditingIndex(idx);
    setTempValue(String(data[idx].calls));
  };

  const onApplyEdit = () => {
    if (editingIndex == null) return;
    const val = Number(tempValue || "0");
    setData((d) => {
      const copy = [...d];
      copy[editingIndex].calls = val;
      return copy;
    });
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/6 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Weekly Calls (Area)</h3>
            <div className="text-sm text-slate-300">Agent: All</div>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stroke="#7c3aed" fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/6 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Weekly Calls (Bar)</h3>
            <div className="text-sm text-slate-300">Editable values</div>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid opacity={0.08} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3">
            <div className="text-sm text-slate-300 mb-2">Tap a day to edit value</div>
            <div className="grid grid-cols-7 gap-2">
              {data.map((d, i) => (
                <button
                  key={d.name}
                  onClick={() => onStartEdit(i)}
                  className="bg-white/4 py-2 rounded-md text-sm"
                >
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-slate-300">{d.calls} calls</div>
                </button>
              ))}
            </div>
          </div>

          {editingIndex != null && (
            <div className="mt-3 flex gap-2 items-center">
              <input
                className="px-3 py-2 rounded-md bg-white/5 outline-none"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
              />
              <button className="px-3 py-2 bg-green-600 rounded-md" onClick={onApplyEdit}>
                Apply
              </button>
              <button className="px-3 py-2 bg-gray-600 rounded-md" onClick={() => setEditingIndex(null)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-indigo-600 rounded-md" onClick={onSave} disabled={loading}>
          Save values
        </button>

        <button
          className="px-4 py-2 bg-white/5 rounded-md"
          onClick={() => {
            setData(defaultData);
          }}>
          Reset to default
        </button>

        {hasExisting && (
          <div className="ml-auto flex items-center gap-3">
            
          </div>
        )}
      </div>
    </div>
  );
}
