"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, SkipForward, Sun, Moon, Shuffle } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

// Tree node structure
interface TreeNode {
  value: number
  left?: TreeNode
  right?: TreeNode
  x?: number
  y?: number
  id: string
}

// Create the tree from the provided image
const createSampleTree = (): TreeNode => {
  return {
    value: 1,
    id: "1",
    left: {
      value: 2,
      id: "2",
      left: {
        value: 4,
        id: "4",
      },
      right: {
        value: 5,
        id: "5",
      },
    },
    right: {
      value: 3,
      id: "3",
      left: {
        value: 6,
        id: "6",
      },
      right: {
        value: 7,
        id: "7",
      },
    },
  }
}

// Calculate positions for tree nodes
const calculatePositions = (node: TreeNode | undefined, x: number, y: number, spacing: number): void => {
  if (!node) return

  node.x = x
  node.y = y

  if (node.left) {
    calculatePositions(node.left, x - spacing, y + 80, spacing / 2)
  }
  if (node.right) {
    calculatePositions(node.right, x + spacing, y + 80, spacing / 2)
  }
}

// Generate inorder traversal steps - optimized for 7 steps
const generateInorderSteps = (
  node: TreeNode | undefined,
  steps: Array<{ action: string; nodeId?: string; value?: number }> = [],
): Array<{ action: string; nodeId?: string; value?: number }> => {
  if (!node) return steps

  // Visit left subtree
  if (node.left) {
    generateInorderSteps(node.left, steps)
  }

  // Visit root (this is the only step we track)
  steps.push({ action: "visit_root", nodeId: node.id, value: node.value })

  // Visit right subtree
  if (node.right) {
    generateInorderSteps(node.right, steps)
  }

  return steps
}

// Generate a random tree with depth 3 and max 7 nodes
const generateRandomTree = (): TreeNode => {
  const nodes = [1, 2, 3, 4, 5, 6, 7]
  const shuffled = [...nodes].sort(() => Math.random() - 0.5)
  
  // Create a tree structure with depth 3 and max 7 nodes
  const createNode = (value: number, depth: number): TreeNode => {
    const node: TreeNode = {
      value,
      id: value.toString(),
    }
    
    if (depth < 3 && shuffled.length > 0) {
      // 70% chance to add left child
      if (Math.random() < 0.7 && shuffled.length > 0) {
        node.left = createNode(shuffled.shift()!, depth + 1)
      }
      // 70% chance to add right child
      if (Math.random() < 0.7 && shuffled.length > 0) {
        node.right = createNode(shuffled.shift()!, depth + 1)
      }
    }
    
    return node
  }
  
  return createNode(shuffled.shift()!, 0)
}

export default function InorderTraversalVisualizer() {
  const [tree, setTree] = useState(() => {
    const sampleTree = createSampleTree()
    calculatePositions(sampleTree, 300, 50, 140)
    return sampleTree
  })

  const [steps, setSteps] = useState(() => generateInorderSteps(tree))
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [traversalResult, setTraversalResult] = useState<number[]>([])
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set())

  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const generateNewTree = () => {
    const newTree = generateRandomTree()
    calculatePositions(newTree, 300, 50, 140)
    setTree(newTree)
    setSteps(generateInorderSteps(newTree))
    setCurrentStep(-1)
    setIsPlaying(false)
    setTraversalResult([])
    setVisitedNodes(new Set())
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        nextStep()
      }, 800)
      return () => clearTimeout(timer)
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, steps.length])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)

      const step = steps[newStep]

      if (step.action === "visit_root" && step.value !== undefined) {
        setTraversalResult((prev) => [...prev, step.value!])
        setVisitedNodes((prev) => new Set([...prev, step.nodeId!]))
      }
    }
  }

  const reset = () => {
    setCurrentStep(-1)
    setIsPlaying(false)
    setTraversalResult([])
    setVisitedNodes(new Set())
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Render tree nodes recursively
  const renderNode = (node: TreeNode | undefined): JSX.Element | null => {
    if (!node || !node.x || !node.y) return null

    const isVisited = visitedNodes.has(node.id)
    const lineColor = isDarkMode ? "#374151" : "#e5e7eb"
    const unvisitedFill = isDarkMode ? "#1f2937" : "#f3f4f6"
    const unvisitedStroke = isDarkMode ? "#4b5563" : "#d1d5db"
    const textColor = isVisited ? "white" : (isDarkMode ? "#e5e7eb" : "#374151")

    return (
      <g key={node.id}>
        {/* Render connections to children */}
        {node.left && node.left.x && node.left.y && (
          <line x1={node.x} y1={node.y} x2={node.left.x} y2={node.left.y} stroke={lineColor} strokeWidth="2" />
        )}
        {node.right && node.right.x && node.right.y && (
          <line x1={node.x} y1={node.y} x2={node.right.x} y2={node.right.y} stroke={lineColor} strokeWidth="2" />
        )}

        {/* Render node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r="25"
          fill={isVisited ? "#22c55e" : unvisitedFill}
          stroke={isVisited ? "#16a34a" : unvisitedStroke}
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* Render node value */}
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="text-lg font-semibold"
          fill={textColor}
        >
          {node.value}
        </text>

        {/* Render children */}
        {renderNode(node.left)}
        {renderNode(node.right)}
      </g>
    )
  }

  const getCurrentStepDescription = () => {
    if (currentStep === -1)
      return "Click 'Next Step' or 'Play' to start the inorder traversal from the leftmost node (4)"

    const step = steps[currentStep]
    switch (step.action) {
      case "visit_left":
        return `Visiting left subtree of node ${step.nodeId}`
      case "visit_root":
        return `Processing node ${step.nodeId} (value: ${step.value}) - Adding to result`
      case "visit_right":
        return `Visiting right subtree of node ${step.nodeId}`
      default:
        return ""
    }
  }

  return (
    <div
      className={`w-full mx-auto p-2 space-y-3 min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Card className={`transition-colors duration-300 ${
        isDarkMode 
          ? "bg-gray-800 border-gray-700 text-white" 
          : "bg-white border-gray-200 text-gray-900"
      }`}>
        <CardHeader className="pb-2 relative">
          <CardTitle className={`text-lg font-bold text-center transition-colors duration-300 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Inorder Traversal
          </CardTitle>
          <Button 
            onClick={toggleDarkMode} 
            variant="ghost" 
            size="sm"
            className={`absolute top-2 right-2 p-2 h-8 w-8 transition-colors duration-300 ${
              isDarkMode 
                ? "text-white hover:bg-gray-700" 
                : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-3 mb-3">
            <Button 
              onClick={togglePlay} 
              variant={isPlaying ? "destructive" : "default"} 
              size="sm"
              className="transition-colors duration-300"
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button 
              onClick={nextStep} 
              disabled={currentStep >= steps.length - 1} 
              variant="outline"
              size="sm"
              className={`transition-colors duration-300 ${
                isDarkMode 
                  ? "border-white text-black hover:bg-white hover:text-gray-900" 
                  : "border-gray-300 text-gray-900 hover:bg-gray-100"
              }`}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Next Step
            </Button>
            <Button 
              onClick={generateNewTree} 
              variant="outline" 
              size="sm"
              className={`transition-colors duration-300 ${
                isDarkMode 
                  ? "border-white text-black hover:bg-white hover:text-gray-900" 
                  : "border-gray-300 text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random
            </Button>
            <Button 
              onClick={reset} 
              variant="outline" 
              size="sm"
              className={`transition-colors duration-300 ${
                isDarkMode 
                  ? "border-white text-black hover:bg-white hover:text-gray-900" 
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Tree Visualization */}
          <div className={`rounded-lg p-3 mb-3 transition-colors duration-300 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-100"
          }`}>
            <svg width="100%" height="350" viewBox="0 0 600 350" className="mx-auto min-w-[600px]">
              {renderNode(tree)}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
                isDarkMode 
                  ? "bg-gray-700 border-gray-500" 
                  : "bg-gray-200 border-gray-300"
              }`}></div>
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>Unvisited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-600"></div>
              <span className={`text-sm transition-colors duration-300 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}>Visited</span>
            </div>
          </div>

          {/* Traversal Result */}
          <div
            className={`border rounded-lg p-3 transition-colors duration-300 ${
              isDarkMode 
                ? "bg-gray-800 border-gray-600" 
                : "bg-green-50 border-green-200"
            }`}
          >
            <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-green-900"
            }`}>
              Inorder Traversal Result:
            </h3>
            <div className="flex flex-wrap gap-2">
              {traversalResult.length === 0 ? (
                <span className={`transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-green-600"
                }`}>No nodes visited yet</span>
              ) : (
                traversalResult.map((value, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className={`text-lg px-3 py-1 transition-colors duration-300 ${
                      isDarkMode 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    }`}
                  >
                    {value}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
