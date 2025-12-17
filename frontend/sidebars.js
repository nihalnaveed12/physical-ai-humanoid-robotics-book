// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'module1-ros2/intro',
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      items: [
        {
          type: 'category',
          label: 'ROS 2 Fundamentals',
          items: [
            'module1-ros2/fundamentals/nodes',
            'module1-ros2/fundamentals/topics',
            'module1-ros2/fundamentals/services',
          ],
        },
        {
          type: 'category',
          label: 'Python-ROS Bridge',
          items: [
            'module1-ros2/python-ros-bridge/rclpy-intro',
            'module1-ros2/python-ros-bridge/examples',
            'module1-ros2/python-ros-bridge/best-practices',
          ],
        },
        {
          type: 'category',
          label: 'URDF Modeling',
          items: [
            'module1-ros2/urdf-modeling/basics',
            'module1-ros2/urdf-modeling/humanoid-urdf',
            'module1-ros2/urdf-modeling/examples',
          ],
        },
        {
          type: 'category',
          label: 'Exercises',
          items: [
            'module1-ros2/exercises/fundamentals-exercises',
            'module1-ros2/exercises/python-bridge-exercises',
            'module1-ros2/exercises/urdf-exercises',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin (Gazebo & Unity)',
      items: [
        'module2-digital-twin/intro',
        {
          type: 'category',
          label: 'Gazebo Setup',
          items: [
            'module2-digital-twin/gazebo-setup',
            'module2-digital-twin/gazebo-physics',
          ],
        },
        {
          type: 'category',
          label: 'Unity Setup',
          items: [
            'module2-digital-twin/unity-setup',
            'module2-digital-twin/unity-physics',
          ],
        },
        {
          type: 'category',
          label: 'Sensor Simulation',
          items: [
            'module2-digital-twin/lidar-simulation',
            'module2-digital-twin/depth-camera-simulation',
            'module2-digital-twin/imu-simulation',
          ],
        },
        {
          type: 'category',
          label: 'Integration Examples',
          items: [
            'module2-digital-twin/integration-examples',
          ],
        },
        {
          type: 'category',
          label: 'References',
          items: [
            'module2-digital-twin/references',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 3: Perception & Sensor Fusion',
      items: [
        'module3-perception-fusion/intro',
        {
          type: 'category',
          label: 'Visual Perception',
          items: [
            'module3-perception-fusion/visual-perception',
          ],
        },
        {
          type: 'category',
          label: 'LiDAR Perception',
          items: [
            'module3-perception-fusion/lidar-perception',
          ],
        },
        {
          type: 'category',
          label: 'IMU State Estimation',
          items: [
            'module3-perception-fusion/imu-state-estimation',
          ],
        },
        {
          type: 'category',
          label: 'Sensor Fusion',
          items: [
            'module3-perception-fusion/sensor-fusion',
          ],
        },
        {
          type: 'category',
          label: 'Kalman Filter Implementation',
          items: [
            'module3-perception-fusion/kalman-filter-implementation',
          ],
        },
        {
          type: 'category',
          label: 'Sensor Validation',
          items: [
            'module3-perception-fusion/sensor-validation',
          ],
        },
        {
          type: 'category',
          label: 'Reality Gap Analysis',
          items: [
            'module3-perception-fusion/reality-gap-analysis',
          ],
        },
        {
          type: 'category',
          label: 'Sim-to-Reality Transfer',
          items: [
            'module3-perception-fusion/sim-reality-transfer-examples',
          ],
        },
        {
          type: 'category',
          label: 'ROS 2 Integration',
          items: [
            'module3-perception-fusion/ros2-sim-reality-integration',
          ],
        },
        {
          type: 'category',
          label: 'Integration Examples',
          items: [
            'module3-perception-fusion/integration-examples',
          ],
        },
        {
          type: 'category',
          label: 'References',
          items: [
            'module3-perception-fusion/references',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        'module4-vla/intro',
        {
          type: 'category',
          label: 'Voice-to-Action Interfaces',
          items: [
            'module4-vla/voice-to-action-interfaces',
          ],
        },
        {
          type: 'category',
          label: 'Cognitive Planning with LLMs',
          items: [
            'module4-vla/cognitive-planning-llms',
          ],
        },
        {
          type: 'category',
          label: 'Vision-Language Integration',
          items: [
            'module4-vla/vision-language-integration',
          ],
        },
        {
          type: 'category',
          label: 'Capstone - Autonomous Humanoid',
          items: [
            'module4-vla/capstone-autonomous-humanoid',
          ],
        },
        {
          type: 'category',
          label: 'References',
          items: [
            'module4-vla/references',
          ],
        },
      ],
    },
    // Add other modules here as they are developed
  ],
};

module.exports = sidebars;