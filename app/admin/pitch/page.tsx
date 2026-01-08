"use client";

import { useState, useEffect, useRef } from "react";
import { IoChevronBack, IoChevronForward, IoExpand, IoContract, IoPlay, IoPause, IoCheckmarkCircle, IoHome, IoCash, IoHelpCircle, IoWarning, IoConstruct, IoTime, IoPeople, IoCamera, IoSearch, IoShield, IoWallet, IoAnalytics, IoCheckmark } from "react-icons/io5";
import { LuWrench, LuDollarSign, LuClock, LuCamera, LuSearch, LuTriangleAlert, LuUsers, LuChartBar, LuVote, LuTrendingUp, LuShield, LuHouse, LuMessageSquare, LuCode, LuSettings, LuArrowRight } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Slide {
  id: number;
  title: string;
  content: React.ReactNode;
}

// Chart data
const growthData = [
  { month: "Aug", users: 120 },
  { month: "Sep", users: 340 },
  { month: "Oct", users: 580 },
  { month: "Nov", users: 920 },
  { month: "Dec", users: 1540 },
  { month: "Jan", users: 2400 },
];

const decisionTypeData = [
  { name: "DIY", value: 42, color: "#10b981" },
  { name: "Hire", value: 31, color: "#3b82f6" },
  { name: "Defer", value: 18, color: "#f59e0b" },
  { name: "Replace", value: 9, color: "#8b5cf6" },
];

const savingsData = [
  { month: "Aug", savings: 12000 },
  { month: "Sep", savings: 38000 },
  { month: "Oct", savings: 85000 },
  { month: "Nov", savings: 156000 },
  { month: "Dec", savings: 248000 },
  { month: "Jan", savings: 340000 },
];

const marketData = [
  { segment: "Home Repair", value: 420, color: "#10b981" },
  { segment: "Auto Care", value: 300, color: "#3b82f6" },
  { segment: "Appliances", value: 50, color: "#f59e0b" },
  { segment: "Property Mgmt", value: 88, color: "#8b5cf6" },
];

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const slides: Slide[] = [
    {
      id: 1,
      title: "Title",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Badge variant="outline" className="mb-8 px-4 py-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            YC W26 Application
          </Badge>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent mb-6">
            Opportuniq
          </h1>
          <p className="text-2xl text-[#888] mb-10">Decision Intelligence for Households</p>
          <div className="flex items-center gap-5">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#333]" />
            <span className="text-base text-[#666]">Making every home decision count</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#333]" />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Problem",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-red-400 border-red-500/30 bg-red-500/10">
            The Problem
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            Homeowners lose <span className="text-red-400">$12B+</span> annually on bad repair decisions
          </h2>
          <div className="grid grid-cols-3 gap-5">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                  <LuWrench className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Wrong DIY Attempts</h3>
                <p className="text-sm text-[#888] leading-relaxed mb-3">
                  $50 YouTube repair turns into $2,000 water damage
                </p>
                <div className="pt-3 border-t border-[#222]">
                  <div className="text-2xl font-bold text-red-400">47%</div>
                  <p className="text-xs text-[#666]">of DIY repairs fail</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                  <LuDollarSign className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Overpaying Contractors</h3>
                <p className="text-sm text-[#888] leading-relaxed mb-3">
                  No visibility into fair pricing or quality
                </p>
                <div className="pt-3 border-t border-[#222]">
                  <div className="text-2xl font-bold text-red-400">3.2x</div>
                  <p className="text-xs text-[#666]">average overpayment</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mb-3">
                  <LuClock className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Catastrophic Deferral</h3>
                <p className="text-sm text-[#888] leading-relaxed mb-3">
                  Small leak ignored becomes foundation damage
                </p>
                <div className="pt-3 border-t border-[#222]">
                  <div className="text-2xl font-bold text-red-400">8x</div>
                  <p className="text-xs text-[#666]">cost escalation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Solution",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            Our Solution
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
            AI that answers: "Is this safe? What could go wrong?"
          </h2>
          <p className="text-base text-[#888] mb-6">Snap a photo → Get diagnosis → See risks & costs → Decide together</p>

          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-[#111] border-[#222] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <LuCamera className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Capture</h3>
                <p className="text-xs text-[#888]">Photo, voice, or text</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                  <LuSearch className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Diagnose</h3>
                <p className="text-xs text-[#888]">AI identifies problem</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <LuTriangleAlert className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Assess Risk</h3>
                <p className="text-xs text-[#888]">Safety + opportunity cost</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500" />
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                  <LuUsers className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">Decide</h3>
                <p className="text-xs text-[#888]">Household votes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-5 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Example: Leaky faucet</p>
                  <p className="text-xs text-[#888]">AI diagnosis → $15 DIY cartridge replacement → Saves $180 vs plumber</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-0 px-3 py-0.5 text-xs">45 min fix</Badge>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 4,
      title: "Product",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-2 px-2.5 py-0.5 text-blue-400 border-blue-500/30 bg-blue-500/10">
            Product Deep Dive
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">More than just diagnosis</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <LuShield className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">"Is This Safe?" Analysis</h4>
                    <p className="text-[10px] text-[#888]">Safety risks surfaced upfront</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <LuTrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">Opportunity Cost + Risk</h4>
                    <p className="text-[10px] text-[#888]">Full cost analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <LuVote className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">Household Voting</h4>
                    <p className="text-[10px] text-[#888]">Decide together</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <LuChartBar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">Budget Integration</h4>
                    <p className="text-[10px] text-[#888]">Track spending & approvals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-3">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-xs mb-2">Decision Distribution</h4>
                  <div className="h-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={decisionTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {decisionTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {decisionTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-[#888]">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 5,
      title: "Traction",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            Traction
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-5 leading-tight">Growing 42% week-over-week</h2>

          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { value: "2,400+", label: "Users", change: "+42% WoW" },
              { value: "$340K", label: "User Savings", change: "+$92K/mo" },
              { value: "89%", label: "Decision Confidence", change: "+12pts" },
              { value: "4.2", label: "Issues/Household/Mo", change: "Retention" },
            ].map((stat, i) => (
              <Card key={i} className="bg-[#111] border-[#222]">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">{stat.value}</p>
                  <p className="text-xs text-[#888] mb-2">{stat.label}</p>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 px-1.5 py-0">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white text-sm mb-3">User Growth</h4>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="month" stroke="#666" fontSize={10} />
                      <YAxis stroke="#666" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#10b981" fill="url(#userGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white text-sm mb-3">Cumulative Savings</h4>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={savingsData}>
                      <defs>
                        <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="month" stroke="#666" fontSize={10} />
                      <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Savings']}
                      />
                      <Area type="monotone" dataKey="savings" stroke="#3b82f6" fill="url(#savingsGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: "Market",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-blue-400 border-blue-500/30 bg-blue-500/10">
            Market Opportunity
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
            <span className="text-blue-400">$857B</span> addressable market
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4">
                <h4 className="font-semibold text-white text-sm mb-3">Market Segments ($B)</h4>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis type="number" stroke="#666" fontSize={10} />
                      <YAxis dataKey="segment" type="category" stroke="#666" fontSize={10} width={85} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`$${value}B`, 'Market Size']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {marketData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Card className="bg-[#111] border-[#222]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#888]">US Households</p>
                      <p className="text-xl font-bold text-white">140M</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <LuHouse className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#222]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#888]">Avg Annual Repair Spend</p>
                      <p className="text-xl font-bold text-white">$4,700</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <LuDollarSign className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-[#111] border-[#222]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[#888]">Want Help Deciding</p>
                      <p className="text-xl font-bold text-white">73%</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <IoHelpCircle className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <Progress value={73} className="mt-3 h-1.5" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Business Model",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-purple-400 border-purple-500/30 bg-purple-500/10">
            Business Model
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-5 leading-tight">Freemium + Marketplace</h2>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-3 px-2 py-0.5 text-xs">Free</Badge>
                <p className="text-2xl font-bold text-white mb-1">$0</p>
                <p className="text-xs text-[#888] mb-3">Forever free</p>
                <ul className="space-y-1.5 text-xs text-[#888]">
                  <li>• 3 issues/month</li>
                  <li>• Basic AI diagnosis</li>
                  <li>• Solo decisions</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-emerald-500/20 to-transparent border-emerald-500/30 relative">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white border-0 px-2 py-0.5 text-xs">Popular</Badge>
              </div>
              <CardContent className="p-4 pt-5">
                <Badge variant="outline" className="mb-3 px-2 py-0.5 text-xs text-emerald-400 border-emerald-500/30">Pro</Badge>
                <p className="text-2xl font-bold text-white mb-1">$12<span className="text-sm text-[#888]">/mo</span></p>
                <p className="text-xs text-[#888] mb-3">Per household</p>
                <ul className="space-y-1.5 text-xs">
                  <li className="text-emerald-400">• Unlimited issues</li>
                  <li className="text-emerald-400">• Household collaboration</li>
                  <li className="text-emerald-400">• Budget tracking</li>
                  <li className="text-emerald-400">• Outcome learning</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-3 px-2 py-0.5 text-xs text-purple-400 border-purple-500/30">Enterprise</Badge>
                <p className="text-2xl font-bold text-white mb-1">Custom</p>
                <p className="text-xs text-[#888] mb-3">Property managers</p>
                <ul className="space-y-1.5 text-xs text-[#888]">
                  <li>• Multi-property</li>
                  <li>• Tenant coordination</li>
                  <li>• Vendor management</li>
                  <li>• Analytics dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-4">
              <h4 className="font-semibold text-white text-sm mb-3">Additional Revenue Streams</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                  <p className="text-emerald-400 font-semibold text-sm">Affiliate</p>
                  <p className="text-xs text-[#888]">Parts & tools (8-12%)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                  <p className="text-blue-400 font-semibold text-sm">Lead Gen</p>
                  <p className="text-xs text-[#888]">Contractor referrals ($25-50)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0a0a0a]">
                  <p className="text-purple-400 font-semibold text-sm">Data</p>
                  <p className="text-xs text-[#888]">Anonymized repair insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 8,
      title: "Competition",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-amber-400 border-amber-500/30 bg-amber-500/10">
            Competitive Landscape
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Why we win</h2>

          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="text-left px-3 py-2 text-[#888] font-medium text-xs">Feature</th>
                    <th className="text-center px-3 py-2 text-emerald-400 font-medium bg-emerald-500/5 text-xs">Opportuniq</th>
                    <th className="text-center px-3 py-2 text-[#888] font-medium text-xs">Angi</th>
                    <th className="text-center px-3 py-2 text-[#888] font-medium text-xs">Yelp</th>
                    <th className="text-center px-3 py-2 text-[#888] font-medium text-xs">YouTube</th>
                    <th className="text-center px-3 py-2 text-[#888] font-medium text-xs">ChatGPT</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "AI Photo Diagnosis", us: true, angi: false, yelp: false, yt: false, gpt: true },
                    { feature: "Risk + Opportunity Cost", us: true, angi: false, yelp: false, yt: false, gpt: false },
                    { feature: "\"Is this safe?\" Analysis", us: true, angi: false, yelp: false, yt: false, gpt: false },
                    { feature: "Household Voting", us: true, angi: false, yelp: false, yt: false, gpt: false },
                    { feature: "Budget Integration", us: true, angi: false, yelp: false, yt: false, gpt: false },
                    { feature: "Local Vendors/Reviews", us: true, angi: true, yelp: true, yt: false, gpt: false },
                    { feature: "Step-by-Step Guides", us: true, angi: false, yelp: false, yt: true, gpt: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-[#1a1a1a]">
                      <td className="px-3 py-2 text-white text-xs">{row.feature}</td>
                      <td className="px-3 py-2 text-center bg-emerald-500/5">
                        {row.us ? <IoCheckmarkCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-[#444]">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.angi ? <IoCheckmarkCircle className="w-4 h-4 text-[#888] mx-auto" /> : <span className="text-[#444]">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.yelp ? <IoCheckmarkCircle className="w-4 h-4 text-[#888] mx-auto" /> : <span className="text-[#444]">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.yt ? <IoCheckmarkCircle className="w-4 h-4 text-[#888] mx-auto" /> : <span className="text-[#444]">—</span>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {row.gpt ? <IoCheckmarkCircle className="w-4 h-4 text-[#888] mx-auto" /> : <span className="text-[#444]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <p className="text-center text-[#888] text-sm mt-4">
            <span className="text-emerald-400 font-medium">Moat:</span> Decision history data + household collaboration network effects
          </p>
        </div>
      ),
    },
    {
      id: 9,
      title: "Team",
      content: (
        <div className="flex flex-col justify-center h-full">
          <Badge variant="outline" className="w-fit mb-3 px-2.5 py-0.5 text-blue-400 border-blue-500/30 bg-blue-500/10">
            Team
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Built by homeowners, for homeowners</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-white">AQ</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">Alvin Quach</h3>
                <p className="text-emerald-400 text-xs mb-2">Co-Founder & CEO</p>
                <p className="text-xs text-[#888] leading-relaxed mb-3">
                  Full-stack engineer with 8+ years experience.
                  Built products used by millions. Homeowner who spent $3K on a repair
                  that should have cost $200.
                </p>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Engineering</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">AI/ML</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Product</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-white">CF</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">Co-Founder</h3>
                <p className="text-blue-400 text-xs mb-2">Co-Founder & COO</p>
                <p className="text-xs text-[#888] leading-relaxed mb-3">
                  Project/Product Manager & Delivery Engineer.
                  Expert in operations and execution. Ensures projects ship on time
                  with quality.
                </p>
                <div className="flex justify-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Project Mgmt</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Delivery</Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">Operations</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#111] border-[#222]">
            <CardContent className="p-4">
              <h4 className="font-semibold text-white text-sm mb-3 text-center">Advisory Network</h4>
              <div className="flex justify-center gap-8">
                {["Home Depot", "Thumbtack", "Zillow", "Lowe's"].map((company) => (
                  <div key={company} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-1.5">
                      <LuSettings className="w-4 h-4 text-[#666]" />
                    </div>
                    <p className="text-xs text-[#888]">{company}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 10,
      title: "Ask",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Badge variant="outline" className="mb-3 px-2.5 py-0.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            The Ask
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-5 leading-tight">Raising $500K Seed</h2>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 mb-5 w-full max-w-xl">
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-bold text-emerald-400 mb-1">40%</p>
                  <p className="text-xs text-white font-medium mb-0.5">Engineering</p>
                  <p className="text-xs text-[#888]">AI improvements, mobile app</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400 mb-1">35%</p>
                  <p className="text-xs text-white font-medium mb-0.5">Growth</p>
                  <p className="text-xs text-[#888]">Content, SEO, partnerships</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400 mb-1">25%</p>
                  <p className="text-xs text-white font-medium mb-0.5">Operations</p>
                  <p className="text-xs text-[#888]">Hiring, infrastructure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xl mb-5">
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-white mb-1">18 mo</p>
                <p className="text-xs text-[#888]">Runway</p>
              </CardContent>
            </Card>
            <Card className="bg-[#111] border-[#222]">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-white mb-1">$1M ARR</p>
                <p className="text-xs text-[#888]">Target</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#333]" />
            <span className="text-[#888] text-sm">50K users by EOY</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#333]" />
          </div>
        </div>
      ),
    },
    {
      id: 11,
      title: "Close",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-white to-emerald-400 bg-clip-text text-transparent mb-3">
            Opportuniq
          </h1>
          <p className="text-xl text-[#888] mb-6">Every household decision, optimized.</p>

          <Card className="bg-[#111] border-[#222] mb-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-[#888] mb-1">Alvin Quach</p>
                  <p className="text-sm text-white">alvin@opportuniq.app</p>
                </div>
                <div className="w-px h-8 bg-[#333]" />
                <div className="text-center">
                  <p className="text-xs text-[#888] mb-1">Kevin</p>
                  <p className="text-sm text-white">kevin@opportuniq.app</p>
                </div>
              </div>
              <p className="text-sm text-emerald-400 text-center mt-3">opportuniq.app</p>
            </CardContent>
          </Card>
          <div className="flex items-center gap-8 text-[#666]">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-0.5">2,400+</p>
              <p className="text-xs">Users</p>
            </div>
            <div className="w-px h-8 bg-[#333]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-0.5">$340K</p>
              <p className="text-xs">Saved</p>
            </div>
            <div className="w-px h-8 bg-[#333]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-0.5">42%</p>
              <p className="text-xs">WoW Growth</p>
            </div>
          </div>

          <p className="text-[#555] mt-8 text-base">Thank you</p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">YC Pitch Deck</h1>
          <p className="text-sm text-[#666]">
            Slide {currentSlide + 1} of {slides.length} — {slides[currentSlide].title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="gap-2"
          >
            {isAutoPlaying ? <IoPause className="w-4 h-4" /> : <IoPlay className="w-4 h-4" />}
            {isAutoPlaying ? "Pause" : "Auto"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <IoContract className="w-4 h-4" /> : <IoExpand className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <Progress value={((currentSlide + 1) / slides.length) * 100} className="h-1 mb-6" />
      <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a]"
        >
          <IoChevronBack className="w-6 h-6" />
        </Button>
        <div className="relative aspect-[16/9] flex-1 max-w-5xl bg-[#0d0d0d] rounded-2xl border border-[#1f1f1f] overflow-hidden shadow-2xl">
          <div className="absolute inset-0 p-12">
            {slides[currentSlide].content}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a]"
        >
          <IoChevronForward className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-all text-xs ${
              currentSlide === index
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-[#2a2a2a] bg-[#1a1a1a] text-[#888] hover:border-[#3a3a3a]"
            }`}
          >
            {slide.title}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-[#444] mt-4">
        ← → Navigate • Space Next • F Fullscreen
      </p>
    </div>
  );
}
