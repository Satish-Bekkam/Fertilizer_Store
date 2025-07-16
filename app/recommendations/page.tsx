"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wheat, Leaf, Sun, Calendar, TrendingUp, AlertCircle, CheckCircle, MessageSquare } from "lucide-react"

// Crop and fertilizer recommendation data
const cropDatabase = {
  Wheat: {
    icon: "🌾",
    season: "Rabi",
    growthStages: ["Sowing", "Tillering", "Jointing", "Flowering", "Grain Filling"],
    fertilizers: {
      Sowing: [
        { name: "DAP", dosage: "100 kg/acre", timing: "At sowing", purpose: "Root development" },
        { name: "Potash", dosage: "50 kg/acre", timing: "At sowing", purpose: "Overall plant health" },
      ],
      Tillering: [
        { name: "Urea", dosage: "50 kg/acre", timing: "20-25 days after sowing", purpose: "Vegetative growth" },
      ],
      Jointing: [{ name: "Urea", dosage: "50 kg/acre", timing: "40-45 days after sowing", purpose: "Stem elongation" }],
      Flowering: [{ name: "NPK 19:19:19", dosage: "25 kg/acre", timing: "At flowering", purpose: "Grain formation" }],
    },
    tips: [
      "Apply fertilizers in split doses for better efficiency",
      "Ensure adequate moisture during fertilizer application",
      "Monitor for pest and disease symptoms",
    ],
  },
  Rice: {
    icon: "🌾",
    season: "Kharif",
    growthStages: ["Transplanting", "Tillering", "Panicle Initiation", "Flowering", "Grain Filling"],
    fertilizers: {
      Transplanting: [
        { name: "DAP", dosage: "125 kg/acre", timing: "Before transplanting", purpose: "Root establishment" },
      ],
      Tillering: [
        { name: "Urea", dosage: "65 kg/acre", timing: "15-20 days after transplanting", purpose: "Tiller development" },
      ],
      "Panicle Initiation": [
        {
          name: "Urea",
          dosage: "65 kg/acre",
          timing: "35-40 days after transplanting",
          purpose: "Panicle development",
        },
        { name: "Potash", dosage: "35 kg/acre", timing: "Same time as urea", purpose: "Grain quality" },
      ],
    },
    tips: [
      "Maintain 2-3 cm water level during fertilizer application",
      "Apply urea in standing water for better absorption",
      "Use zinc sulfate if deficiency symptoms appear",
    ],
  },
  Cotton: {
    icon: "🌱",
    season: "Kharif",
    growthStages: ["Sowing", "Squaring", "Flowering", "Boll Development", "Maturity"],
    fertilizers: {
      Sowing: [
        { name: "DAP", dosage: "125 kg/acre", timing: "At sowing", purpose: "Root development" },
        { name: "Potash", dosage: "50 kg/acre", timing: "At sowing", purpose: "Plant vigor" },
      ],
      Squaring: [
        { name: "Urea", dosage: "100 kg/acre", timing: "30-35 days after sowing", purpose: "Vegetative growth" },
      ],
      Flowering: [{ name: "NPK 19:19:19", dosage: "50 kg/acre", timing: "At flowering", purpose: "Boll formation" }],
    },
    tips: [
      "Avoid excess nitrogen during flowering to prevent excessive vegetative growth",
      "Apply potash for better fiber quality",
      "Monitor for bollworm and apply appropriate measures",
    ],
  },
  Sugarcane: {
    icon: "🎋",
    season: "Annual",
    growthStages: ["Planting", "Tillering", "Grand Growth", "Maturity"],
    fertilizers: {
      Planting: [
        { name: "DAP", dosage: "150 kg/acre", timing: "At planting", purpose: "Root establishment" },
        { name: "Potash", dosage: "100 kg/acre", timing: "At planting", purpose: "Cane quality" },
      ],
      Tillering: [
        { name: "Urea", dosage: "200 kg/acre", timing: "45-60 days after planting", purpose: "Tiller development" },
      ],
      "Grand Growth": [
        { name: "Urea", dosage: "100 kg/acre", timing: "90-120 days after planting", purpose: "Cane elongation" },
      ],
    },
    tips: [
      "Apply fertilizers in furrows and cover with soil",
      "Ensure adequate irrigation after fertilizer application",
      "Apply micronutrients if deficiency symptoms appear",
    ],
  },
}

const weatherConditions = [
  { condition: "Sunny", icon: "☀️", recommendation: "Good for fertilizer application" },
  { condition: "Cloudy", icon: "☁️", recommendation: "Ideal for fertilizer application" },
  { condition: "Rainy", icon: "🌧️", recommendation: "Avoid fertilizer application" },
  { condition: "Windy", icon: "💨", recommendation: "Use caution with foliar sprays" },
]

export default function RecommendationsPage() {
  const [selectedCrop, setSelectedCrop] = useState("")
  const [growthStage, setGrowthStage] = useState("")
  const [soilType, setSoilType] = useState("")
  const [farmSize, setFarmSize] = useState("")
  const [currentWeather, setCurrentWeather] = useState("Sunny")

  const cropData = selectedCrop ? cropDatabase[selectedCrop] : null
  const recommendations = cropData && growthStage ? cropData.fertilizers[growthStage] || [] : []

  const calculateFertilizerAmount = (dosage, size) => {
    if (!size || !dosage) return dosage
    const amount = Number.parseFloat(dosage.split(" ")[0])
    const unit = dosage.split(" ")[1]
    const farmSizeNum = Number.parseFloat(size)
    return `${(amount * farmSizeNum).toFixed(1)} ${unit}`
  }

  const sendRecommendationWhatsApp = () => {
    if (!selectedCrop || !growthStage) {
      alert("Please select crop and growth stage first")
      return
    }
    alert(`Fertilizer recommendations for ${selectedCrop} (${growthStage}) sent via WhatsApp`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fertilizer Recommendations</h1>
              <p className="text-gray-600">Get crop-specific fertilizer recommendations</p>
            </div>
            <Button onClick={sendRecommendationWhatsApp}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Share via WhatsApp
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wheat className="h-5 w-5 mr-2" />
              Crop Information
            </CardTitle>
            <CardDescription>Enter your crop details to get personalized fertilizer recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Crop Type</label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(cropDatabase).map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {cropDatabase[crop].icon} {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Growth Stage</label>
                <Select value={growthStage} onValueChange={setGrowthStage} disabled={!selectedCrop}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropData?.growthStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Soil Type</label>
                <Select value={soilType} onValueChange={setSoilType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="black">Black Cotton</SelectItem>
                    <SelectItem value="red">Red Soil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Farm Size (acres)</label>
                <Input
                  type="number"
                  placeholder="Enter farm size"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Alert */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Sun className="h-5 w-5 mr-2" />
              Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weatherConditions.map((weather) => (
                <div
                  key={weather.condition}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    currentWeather === weather.condition ? "border-blue-500 bg-blue-100" : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setCurrentWeather(weather.condition)}
                >
                  <div className="text-2xl mb-1">{weather.icon}</div>
                  <div className="font-medium text-sm">{weather.condition}</div>
                  <div className="text-xs text-gray-600">{weather.recommendation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {selectedCrop && growthStage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Recommendations */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Fertilizer Recommendations for {selectedCrop}
                  </CardTitle>
                  <CardDescription>
                    {growthStage} stage • {cropData?.season} season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {recommendations.map((rec, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{rec.name}</h4>
                              <p className="text-sm text-gray-600">{rec.purpose}</p>
                            </div>
                            <Badge variant="outline">{rec.timing}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <span className="text-sm font-medium">Recommended Dosage:</span>
                              <p className="text-lg font-bold text-green-600">
                                {farmSize ? calculateFertilizerAmount(rec.dosage, farmSize) : rec.dosage}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium">Application Method:</span>
                              <p className="text-sm">Broadcast and incorporate</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-700">Suitable for current weather</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No specific recommendations for this growth stage</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Tips */}
              {cropData?.tips && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Expert Tips for {selectedCrop}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {cropData.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Crop Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Growth Stages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cropData?.growthStages.map((stage, index) => (
                      <div
                        key={stage}
                        className={`flex items-center space-x-3 p-2 rounded ${
                          stage === growthStage ? "bg-green-100 border border-green-300" : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            stage === growthStage ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{stage}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Season:</span>
                    <Badge variant="outline">{cropData?.season}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Growth Stages:</span>
                    <span className="text-sm font-medium">{cropData?.growthStages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Weather:</span>
                    <span className="text-sm font-medium">{currentWeather}</span>
                  </div>
                  {farmSize && (
                    <div className="flex justify-between">
                      <span className="text-sm">Farm Size:</span>
                      <span className="text-sm font-medium">{farmSize} acres</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Expert */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Need Expert Advice?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">
                    Get personalized recommendations from our agricultural experts
                  </p>
                  <Button variant="outline" className="w-full bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat with Expert
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {!selectedCrop && (
          <Card className="text-center py-12">
            <CardContent>
              <Wheat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select Your Crop to Get Started</h3>
              <p className="text-gray-500 mb-6">
                Choose your crop type and growth stage to receive personalized fertilizer recommendations
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {Object.entries(cropDatabase).map(([crop, data]) => (
                  <Button
                    key={crop}
                    variant="outline"
                    className="h-20 flex flex-col space-y-2 bg-transparent"
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <span className="text-2xl">{data.icon}</span>
                    <span className="text-sm">{crop}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
