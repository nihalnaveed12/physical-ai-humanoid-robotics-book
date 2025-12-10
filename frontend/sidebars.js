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
    // Add other modules here as they are developed
  ],
};

module.exports = sidebars;