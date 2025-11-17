import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Root Navigator - Main navigation structure
 */
const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={TabNavigator}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

/**
 * Tab Navigator - Bottom tabs
 */
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator>
      {/* Add tab screens here */}
    </Tab.Navigator>
  );
};

export default RootNavigator;
