# Data Model: Vision-Language-Action (VLA) Module

## Overview
This document defines the data models for the Vision-Language-Action (VLA) module, including entities, their relationships, and validation rules based on the functional requirements.

## Core Entities

### 1. VoiceCommand
**Description**: A spoken instruction that initiates the VLA pipeline, containing natural language intent

**Fields**:
- `id`: String (unique identifier)
- `text`: String (transcribed voice command)
- `timestamp`: DateTime (when command was received)
- `confidence`: Float (speech recognition confidence, 0.0-1.0)
- `userId`: String (identifier for user who issued command)
- `context`: Object (environmental context for command)

**Validation Rules**:
- `text` must not be empty
- `confidence` must be between 0.0 and 1.0
- `timestamp` must be in the past or present

### 2. ActionPlan
**Description**: A structured sequence of executable tasks generated from natural language, containing navigation, manipulation, and perception steps

**Fields**:
- `id`: String (unique identifier)
- `voiceCommandId`: String (reference to originating VoiceCommand)
- `tasks`: Array of Task objects (sequence of tasks to execute)
- `status`: Enum ['pending', 'executing', 'completed', 'failed']
- `createdAt`: DateTime (when plan was created)
- `updatedAt`: DateTime (when plan status was last updated)
- `estimatedDuration`: Integer (estimated time in seconds)

**Validation Rules**:
- `tasks` array must not be empty
- `status` must be one of the defined enum values
- `estimatedDuration` must be positive

### 3. Task
**Description**: An individual task within an action plan

**Fields**:
- `id`: String (unique identifier)
- `type`: Enum ['navigation', 'manipulation', 'perception', 'communication']
- `description`: String (human-readable description)
- `parameters`: Object (task-specific parameters)
- `dependencies`: Array of Task IDs (tasks that must complete before this one)
- `priority`: Integer (execution priority, lower number = higher priority)

**Validation Rules**:
- `type` must be one of the defined enum values
- `priority` must be non-negative

### 4. PerceptionContext
**Description**: Visual and spatial information from Module 3 that provides context for disambiguating language commands

**Fields**:
- `id`: String (unique identifier)
- `timestamp`: DateTime (when perception data was captured)
- `detectedObjects`: Array of ObjectInfo objects
- `environmentMap`: Object (spatial map of environment)
- `robotPose`: Object (current robot position and orientation)

**Validation Rules**:
- `timestamp` must be in the past or present
- `detectedObjects` may be empty but must be an array

### 5. ObjectInfo
**Description**: Information about a detected object in the environment

**Fields**:
- `id`: String (unique identifier for object)
- `name`: String (object name or classification)
- `position`: Object {x: Float, y: Float, z: Float} (3D position in space)
- `orientation`: Object {x: Float, y: Float, z: Float, w: Float} (quaternion rotation)
- `confidence`: Float (detection confidence, 0.0-1.0)
- `properties`: Object (additional properties like color, size, etc.)

**Validation Rules**:
- `confidence` must be between 0.0 and 1.0
- `position` must have valid x, y, z coordinates

### 6. ExecutionFeedback
**Description**: Status updates and results from action execution that inform the user and system about task progress

**Fields**:
- `id`: String (unique identifier)
- `actionPlanId`: String (reference to the action plan)
- `taskId`: String (reference to the specific task)
- `status`: Enum ['pending', 'in_progress', 'completed', 'failed', 'cancelled']
- `timestamp`: DateTime (when feedback was generated)
- `message`: String (descriptive message about status)
- `progress`: Float (progress percentage, 0.0-1.0)
- `errorDetails`: Object (details if status is 'failed')

**Validation Rules**:
- `status` must be one of the defined enum values
- `progress` must be between 0.0 and 1.0
- `timestamp` must be in the past or present

### 7. LLMResponse
**Description**: Response from the Large Language Model containing the action plan

**Fields**:
- `id`: String (unique identifier)
- `voiceCommandId`: String (reference to the original voice command)
- `rawResponse`: String (full response from LLM)
- `structuredPlan`: Object (parsed action plan)
- `tokensUsed`: Integer (number of tokens consumed)
- `processingTime`: Float (time taken in seconds)
- `modelUsed`: String (LLM model identifier)

**Validation Rules**:
- `tokensUsed` must be non-negative
- `processingTime` must be positive

## Relationships

### VoiceCommand → ActionPlan
- One-to-Many relationship
- A single voice command can generate multiple action plans (for retries, alternatives)

### ActionPlan → Task
- One-to-Many relationship
- An action plan consists of multiple tasks

### Task → ExecutionFeedback
- One-to-Many relationship
- A task can generate multiple feedback updates during execution

### PerceptionContext → ObjectInfo
- One-to-Many relationship
- A perception context contains multiple detected objects

### LLMResponse → ActionPlan
- One-to-One relationship
- Each LLM response corresponds to one action plan

## State Transitions

### ActionPlan Status Transitions
- `pending` → `executing` (when execution begins)
- `executing` → `completed` (when all tasks complete successfully)
- `executing` → `failed` (when a task fails and no recovery possible)
- `executing` → `pending` (when plan is paused)

### Task Status Transitions
- `pending` → `in_progress` (when task execution begins)
- `in_progress` → `completed` (when task completes successfully)
- `in_progress` → `failed` (when task execution fails)
- `in_progress` → `pending` (when task is paused)

### ExecutionFeedback Progress Flow
- Starts at 0.0
- Increments as task progresses
- Reaches 1.0 when task is completed
- May decrease if task needs to be retried

## Data Validation Summary

All entities must include proper validation to ensure data integrity:
- Required fields must be present
- Data types must match defined types
- Enum values must be from the defined set
- Numeric ranges must be validated
- Cross-references must point to existing entities