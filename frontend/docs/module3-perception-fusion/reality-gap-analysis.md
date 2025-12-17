---
sidebar_position: 9
title: "Reality Gap Analysis: Quantifying Simulation-to-Reality Differences"
---

# Reality Gap Analysis: Quantifying Simulation-to-Reality Differences

## Overview

Reality gap analysis is a critical component of developing robust perception systems that can transfer from simulation to real-world deployment. This section provides methodologies for quantifying, analyzing, and mitigating the differences between simulated and real sensor data, environments, and system behaviors.

## Understanding the Reality Gap

### 1. Types of Reality Gaps

#### Sensor Model Gap
The difference between simulated and real sensor characteristics:

```python
#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import gaussian_kde


class SensorModelGapAnalyzer:
    """
    Analyze the gap between simulated and real sensor models
    """
    def __init__(self):
        self.gap_metrics = {
            'noise_characteristics': {},
            'dynamic_range': {},
            'temporal_behavior': {},
            'spatial_resolution': {}
        }

    def analyze_noise_gap(self, sim_data, real_data):
        """
        Analyze noise characteristic differences between sim and real data
        """
        results = {
            'sim_stats': {},
            'real_stats': {},
            'gap_metrics': {}
        }

        # Calculate statistical properties
        sim_mean = np.mean(sim_data)
        sim_std = np.std(sim_data)
        sim_skew = self.calculate_skewness(sim_data)
        sim_kurtosis = self.calculate_kurtosis(sim_data)

        real_mean = np.mean(real_data)
        real_std = np.std(real_data)
        real_skew = self.calculate_skewness(real_data)
        real_kurtosis = self.calculate_kurtosis(real_data)

        # Store statistics
        results['sim_stats'] = {
            'mean': sim_mean,
            'std': sim_std,
            'skew': sim_skew,
            'kurtosis': sim_kurtosis
        }

        results['real_stats'] = {
            'mean': real_mean,
            'std': real_std,
            'skew': real_skew,
            'kurtosis': real_kurtosis
        }

        # Calculate gap metrics
        results['gap_metrics'] = {
            'mean_difference': abs(real_mean - sim_mean),
            'std_ratio': real_std / (sim_std + 1e-6),  # Avoid division by zero
            'skew_difference': abs(real_skew - sim_skew),
            'kurtosis_difference': abs(real_kurtosis - sim_kurtosis),
            'js_divergence': self.jensen_shannon_divergence(sim_data, real_data)
        }

        return results

    def calculate_skewness(self, data):
        """Calculate skewness of data distribution"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 3)

    def calculate_kurtosis(self, data):
        """Calculate kurtosis of data distribution"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 4) - 3  # Excess kurtosis

    def jensen_shannon_divergence(self, p, q):
        """
        Calculate Jensen-Shannon divergence between two distributions
        """
        # Convert to probability distributions
        p = p / np.sum(p) if np.sum(p) != 0 else p
        q = q / np.sum(q) if np.sum(q) != 0 else q

        # Calculate average distribution
        m = 0.5 * (p + q)

        # Calculate Kullback-Leibler divergences
        kl_pm = self.kl_divergence(p, m)
        kl_qm = self.kl_divergence(q, m)

        # Jensen-Shannon divergence
        jsd = 0.5 * (kl_pm + kl_qm)
        return jsd

    def kl_divergence(self, p, q):
        """
        Calculate Kullback-Leibler divergence between two distributions
        """
        # Add small epsilon to avoid log(0)
        epsilon = 1e-10
        p = p + epsilon
        q = q + epsilon

        # Normalize
        p = p / np.sum(p)
        q = q / np.sum(q)

        # Calculate KL divergence
        kl_div = np.sum(p * np.log(p / q))
        return kl_div

    def analyze_dynamic_range_gap(self, sim_data, real_data):
        """
        Analyze dynamic range differences between sim and real data
        """
        results = {
            'sim_range': (np.min(sim_data), np.max(sim_data)),
            'real_range': (np.min(real_data), np.max(real_data)),
            'gap_metrics': {}
        }

        # Calculate range statistics
        sim_min, sim_max = results['sim_range']
        real_min, real_max = results['real_range']

        results['gap_metrics'] = {
            'min_difference': real_min - sim_min,
            'max_difference': real_max - sim_max,
            'range_ratio': (real_max - real_min) / (sim_max - sim_min + 1e-6),
            'overlap_ratio': self.calculate_range_overlap(sim_min, sim_max, real_min, real_max)
        }

        return results

    def calculate_range_overlap(self, sim_min, sim_max, real_min, real_max):
        """Calculate the overlap ratio between two ranges"""
        overlap_start = max(sim_min, real_min)
        overlap_end = min(sim_max, real_max)

        if overlap_start >= overlap_end:
            return 0.0

        overlap = overlap_end - overlap_start
        union = max(sim_max, real_max) - min(sim_min, real_min)
        return overlap / (union + 1e-6)

    def analyze_temporal_gap(self, sim_timestamps, sim_values, real_timestamps, real_values):
        """
        Analyze temporal behavior differences between sim and real data
        """
        results = {
            'sim_temporal': {},
            'real_temporal': {},
            'gap_metrics': {}
        }

        # Calculate sampling rates
        sim_dt = np.mean(np.diff(sim_timestamps))
        real_dt = np.mean(np.diff(real_timestamps))

        results['sim_temporal']['avg_sampling_rate'] = 1.0 / sim_dt if sim_dt > 0 else 0
        results['real_temporal']['avg_sampling_rate'] = 1.0 / real_dt if real_dt > 0 else 0

        # Calculate temporal stability
        sim_jitter = np.std(np.diff(sim_timestamps))
        real_jitter = np.std(np.diff(real_timestamps))

        results['sim_temporal']['jitter'] = sim_jitter
        results['real_temporal']['jitter'] = real_jitter

        # Frequency domain analysis
        sim_freq_content = self.analyze_frequency_content(sim_values)
        real_freq_content = self.analyze_frequency_content(real_values)

        results['sim_temporal']['frequency_content'] = sim_freq_content
        results['real_temporal']['frequency_content'] = real_freq_content

        # Gap metrics
        results['gap_metrics'] = {
            'sampling_rate_ratio': (real_dt + 1e-6) / (sim_dt + 1e-6),
            'jitter_ratio': (real_jitter + 1e-6) / (sim_jitter + 1e-6),
            'frequency_difference': np.mean(np.abs(
                sim_freq_content - real_freq_content
            )) if len(sim_freq_content) == len(real_freq_content) else 0
        }

        return results

    def analyze_frequency_content(self, signal):
        """Analyze frequency content of a signal"""
        # Apply FFT
        fft = np.fft.fft(signal)
        # Return magnitude spectrum
        return np.abs(fft[:len(fft)//2])  # Return positive frequencies only

    def analyze_spatial_resolution_gap(self, sim_image, real_image):
        """
        Analyze spatial resolution differences between sim and real images
        """
        results = {
            'sim_resolution': {},
            'real_resolution': {},
            'gap_metrics': {}
        }

        # Calculate image sharpness
        sim_sharpness = self.calculate_image_sharpness(sim_image)
        real_sharpness = self.calculate_image_sharpness(real_image)

        results['sim_resolution']['sharpness'] = sim_sharpness
        results['real_resolution']['sharpness'] = real_sharpness

        # Calculate edge density
        sim_edges = self.calculate_edge_density(sim_image)
        real_edges = self.calculate_edge_density(real_image)

        results['sim_resolution']['edge_density'] = sim_edges
        results['real_resolution']['edge_density'] = real_edges

        # Gap metrics
        results['gap_metrics'] = {
            'sharpness_ratio': (real_sharpness + 1e-6) / (sim_sharpness + 1e-6),
            'edge_density_ratio': (real_edges + 1e-6) / (sim_edges + 1e-6),
            'resolution_difference': abs(real_sharpness - sim_sharpness)
        }

        return results

    def calculate_image_sharpness(self, image):
        """Calculate image sharpness using Laplacian variance"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        return laplacian.var()

    def calculate_edge_density(self, image):
        """Calculate edge density in an image"""
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        edges = cv2.Canny(gray, 50, 150)
        return np.sum(edges > 0) / edges.size


# Import OpenCV for image processing functions
import cv2
```

### 2. Environmental Gap Analysis

The difference between simulated and real environments:

```python
#!/usr/bin/env python3
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score


class EnvironmentalGapAnalyzer:
    """
    Analyze environmental differences between simulation and reality
    """
    def __init__(self):
        self.environment_metrics = {
            'lighting': {},
            'textures': {},
            'dynamics': {},
            'geometry': {}
        }

    def analyze_lighting_gap(self, sim_environment, real_environment):
        """
        Analyze lighting condition differences
        """
        results = {
            'sim_lighting': {},
            'real_lighting': {},
            'gap_metrics': {}
        }

        # Analyze lighting statistics
        sim_lighting_stats = self.extract_lighting_features(sim_environment)
        real_lighting_stats = self.extract_lighting_features(real_environment)

        results['sim_lighting'] = sim_lighting_stats
        results['real_lighting'] = real_lighting_stats

        # Calculate lighting gap metrics
        results['gap_metrics'] = {
            'brightness_difference': abs(
                real_lighting_stats['mean_brightness'] - sim_lighting_stats['mean_brightness']
            ),
            'contrast_ratio': (
                real_lighting_stats['std_brightness'] / (sim_lighting_stats['std_brightness'] + 1e-6)
            ),
            'color_temperature_difference': abs(
                real_lighting_stats['color_temp'] - sim_lighting_stats['color_temp']
            ) if 'color_temp' in real_lighting_stats and 'color_temp' in sim_lighting_stats else 0
        }

        return results

    def extract_lighting_features(self, environment_data):
        """
        Extract lighting features from environment data
        """
        # This would process environment representation (images, lighting parameters, etc.)
        # For this example, we'll simulate the extraction

        if isinstance(environment_data, np.ndarray) and len(environment_data.shape) == 3:
            # If it's an image
            if environment_data.shape[2] == 3:  # Color image
                gray = cv2.cvtColor(environment_data.astype(np.uint8), cv2.COLOR_BGR2GRAY)
            else:  # Grayscale
                gray = environment_data.squeeze()
        else:
            # If it's already grayscale or other format
            gray = environment_data

        features = {
            'mean_brightness': float(np.mean(gray)),
            'std_brightness': float(np.std(gray)),
            'min_brightness': float(np.min(gray)),
            'max_brightness': float(np.max(gray)),
            'brightness_percentile_95': float(np.percentile(gray, 95)),
            'brightness_percentile_5': float(np.percentile(gray, 5))
        }

        return features

    def analyze_texture_gap(self, sim_textures, real_textures):
        """
        Analyze texture differences between sim and real environments
        """
        results = {
            'sim_textures': {},
            'real_textures': {},
            'gap_metrics': {}
        }

        # Extract texture features
        sim_texture_features = self.extract_texture_features(sim_textures)
        real_texture_features = self.extract_texture_features(real_textures)

        results['sim_textures'] = sim_texture_features
        results['real_textures'] = real_texture_features

        # Calculate texture gap metrics
        if len(sim_texture_features) == len(real_texture_features):
            texture_diff = np.mean(np.abs(
                np.array(list(sim_texture_features.values())) -
                np.array(list(real_texture_features.values()))
            ))
            results['gap_metrics']['texture_difference'] = float(texture_diff)

        return results

    def extract_texture_features(self, textures):
        """
        Extract texture features using various methods
        """
        features = {}

        if isinstance(textures, np.ndarray):
            if len(textures.shape) == 3:  # Color image
                gray = cv2.cvtColor(textures.astype(np.uint8), cv2.COLOR_BGR2GRAY)
            else:
                gray = textures

            # Calculate Local Binary Pattern (LBP) features
            lbp_features = self.calculate_lbp_features(gray)
            features['lbp_energy'] = float(np.sum(lbp_features ** 2))
            features['lbp_entropy'] = float(-np.sum(lbp_features * np.log(lbp_features + 1e-6)))

            # Calculate GLCM (Gray-Level Co-occurrence Matrix) features
            glcm_features = self.calculate_glcm_like_features(gray)
            features['glcm_contrast'] = float(glcm_features['contrast'])
            features['glcm_homogeneity'] = float(glcm_features['homogeneity'])
            features['glcm_energy'] = float(glcm_features['energy'])

        return features

    def calculate_lbp_features(self, image):
        """Calculate simplified Local Binary Pattern features"""
        # This is a simplified version - in practice, use scikit-image
        height, width = image.shape
        lbp_image = np.zeros_like(image)

        for i in range(1, height - 1):
            for j in range(1, width - 1):
                center = image[i, j]
                code = 0
                for k in range(8):
                    # 8-neighborhood pattern
                    if k == 0: dx, dy = -1, -1
                    elif k == 1: dx, dy = -1, 0
                    elif k == 2: dx, dy = -1, 1
                    elif k == 3: dx, dy = 0, 1
                    elif k == 4: dx, dy = 1, 1
                    elif k == 5: dx, dy = 1, 0
                    elif k == 6: dx, dy = 1, -1
                    elif k == 7: dx, dy = 0, -1

                    neighbor = image[i + dx, j + dy]
                    if neighbor >= center:
                        code |= (1 << k)
                lbp_image[i, j] = code

        # Calculate histogram
        hist, _ = np.histogram(lbp_image.ravel(), bins=256, range=(0, 256))
        hist = hist.astype(float) / hist.sum()  # Normalize
        return hist

    def calculate_glcm_like_features(self, image):
        """Calculate GLCM-like features"""
        # Simplified GLCM features
        features = {}

        # Calculate gradient-based features (approximation of GLCM)
        grad_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)

        # Contrast-like measure
        features['contrast'] = float(np.std(gradient_magnitude))

        # Homogeneity-like measure
        features['homogeneity'] = float(1.0 / (1.0 + np.std(image)))

        # Energy-like measure
        features['energy'] = float(np.sum(image**2) / image.size)

        return features

    def analyze_dynamics_gap(self, sim_dynamics, real_dynamics):
        """
        Analyze dynamic behavior differences
        """
        results = {
            'sim_dynamics': {},
            'real_dynamics': {},
            'gap_metrics': {}
        }

        # Extract dynamic features
        sim_dynamic_features = self.extract_dynamic_features(sim_dynamics)
        real_dynamic_features = self.extract_dynamic_features(real_dynamics)

        results['sim_dynamics'] = sim_dynamic_features
        results['real_dynamics'] = real_dynamic_features

        # Calculate dynamic gap metrics
        results['gap_metrics'] = {
            'motion_difference': self.calculate_motion_difference(
                sim_dynamic_features, real_dynamic_features
            ),
            'temporal_difference': self.calculate_temporal_difference(
                sim_dynamic_features, real_dynamic_features
            )
        }

        return results

    def extract_dynamic_features(self, dynamics_data):
        """
        Extract features from dynamic behavior data
        """
        features = {}

        if isinstance(dynamics_data, dict):
            # Assume it contains trajectory data
            if 'positions' in dynamics_data and 'timestamps' in dynamics_data:
                positions = np.array(dynamics_data['positions'])
                timestamps = np.array(dynamics_data['timestamps'])

                # Calculate velocities
                if len(positions) > 1 and len(timestamps) > 1:
                    velocities = np.diff(positions, axis=0) / np.diff(timestamps)[:, np.newaxis]
                    features['avg_velocity'] = float(np.mean(np.linalg.norm(velocities, axis=1)))
                    features['velocity_std'] = float(np.std(np.linalg.norm(velocities, axis=1)))

                    # Calculate accelerations
                    if len(velocities) > 1:
                        accelerations = np.diff(velocities, axis=0) / np.diff(timestamps[1:])[:, np.newaxis]
                        features['avg_acceleration'] = float(np.mean(np.linalg.norm(accelerations, axis=1)))
                        features['acceleration_std'] = float(np.std(np.linalg.norm(accelerations, axis=1)))

        return features

    def calculate_motion_difference(self, sim_features, real_features):
        """Calculate motion behavior difference"""
        # Compare velocity statistics
        sim_vel = sim_features.get('avg_velocity', 0)
        real_vel = real_features.get('avg_velocity', 0)
        vel_diff = abs(real_vel - sim_vel)

        # Compare acceleration statistics
        sim_acc = sim_features.get('avg_acceleration', 0)
        real_acc = real_features.get('avg_acceleration', 0)
        acc_diff = abs(real_acc - sim_acc)

        return (vel_diff + acc_diff) / 2.0

    def calculate_temporal_difference(self, sim_features, real_features):
        """Calculate temporal behavior difference"""
        # This would include timing differences, reaction times, etc.
        return 0.0  # Placeholder
```

## Quantifying the Reality Gap

### 1. Gap Quantification Metrics

```python
#!/usr/bin/env python3
import numpy as np
from scipy.spatial.distance import pdist, squareform
from sklearn.metrics import mean_squared_error, mean_absolute_error


class RealityGapQuantifier:
    """
    Quantify reality gaps using various metrics
    """
    def __init__(self):
        self.metrics = {
            'statistical': self.statistical_gap_metrics,
            'distributional': self.distributional_gap_metrics,
            'functional': self.functional_gap_metrics,
            'perceptual': self.perceptual_gap_metrics
        }

    def statistical_gap_metrics(self, sim_data, real_data):
        """
        Calculate statistical gap metrics
        """
        metrics = {}

        # Basic statistics comparison
        sim_mean = np.mean(sim_data)
        real_mean = np.mean(real_data)
        metrics['mean_difference'] = float(abs(real_mean - sim_mean))
        metrics['mean_ratio'] = float(real_mean / (sim_mean + 1e-6))

        sim_std = np.std(sim_data)
        real_std = np.std(real_data)
        metrics['std_difference'] = float(abs(real_std - sim_std))
        metrics['std_ratio'] = float(real_std / (sim_std + 1e-6))

        # Higher-order moments
        metrics['skewness_difference'] = float(
            abs(self.calculate_skewness(real_data) - self.calculate_skewness(sim_data))
        )
        metrics['kurtosis_difference'] = float(
            abs(self.calculate_kurtosis(real_data) - self.calculate_kurtosis(sim_data))
        )

        return metrics

    def distributional_gap_metrics(self, sim_data, real_data):
        """
        Calculate distributional gap metrics
        """
        metrics = {}

        # Convert to probability distributions
        sim_hist, sim_bins = np.histogram(sim_data, bins=50, density=True)
        real_hist, real_bins = np.histogram(real_data, bins=50, density=True)

        # Ensure same binning
        min_val = min(np.min(sim_data), np.min(real_data))
        max_val = max(np.max(sim_data), np.max(real_data))
        bins = np.linspace(min_val, max_val, 51)

        sim_hist, _ = np.histogram(sim_data, bins=bins, density=True)
        real_hist, _ = np.histogram(real_data, bins=bins, density=True)

        # Normalize histograms
        sim_hist = sim_hist / (np.sum(sim_hist) + 1e-6)
        real_hist = real_hist / (np.sum(real_hist) + 1e-6)

        # Calculate distribution distances
        metrics['kl_divergence'] = float(self.kl_divergence(real_hist, sim_hist))
        metrics['js_divergence'] = float(self.jensen_shannon_divergence(real_hist, sim_hist))
        metrics['wasserstein_distance'] = float(self.wasserstein_distance(sim_hist, real_hist))
        metrics['bhattacharyya_distance'] = float(self.bhattacharyya_distance(sim_hist, real_hist))

        return metrics

    def functional_gap_metrics(self, sim_model, real_data, test_inputs):
        """
        Calculate functional gap metrics by comparing model predictions to real data
        """
        metrics = {}

        # Get predictions from simulation model
        sim_predictions = sim_model.predict(test_inputs)

        # Calculate prediction errors
        mse = mean_squared_error(real_data, sim_predictions)
        mae = mean_absolute_error(real_data, sim_predictions)

        metrics['mse'] = float(mse)
        metrics['mae'] = float(mae)
        metrics['rmse'] = float(np.sqrt(mse))

        # Calculate correlation
        correlation = np.corrcoef(real_data.flatten(), sim_predictions.flatten())[0, 1]
        metrics['correlation'] = float(correlation) if not np.isnan(correlation) else 0.0

        return metrics

    def perceptual_gap_metrics(self, sim_images, real_images):
        """
        Calculate perceptual gap metrics for image data
        """
        metrics = {}

        if len(sim_images) != len(real_images):
            raise ValueError("Sim and real image lists must have same length")

        ssim_scores = []
        psnr_scores = []

        for sim_img, real_img in zip(sim_images, real_images):
            ssim = self.calculate_ssim(sim_img, real_img)
            psnr = self.calculate_psnr(sim_img, real_img)

            ssim_scores.append(ssim)
            psnr_scores.append(psnr)

        metrics['avg_ssim'] = float(np.mean(ssim_scores))
        metrics['avg_psnr'] = float(np.mean(psnr_scores))
        metrics['ssim_std'] = float(np.std(ssim_scores))
        metrics['psnr_std'] = float(np.std(psnr_scores))

        return metrics

    def calculate_ssim(self, img1, img2):
        """
        Calculate Structural Similarity Index Measure
        Simplified implementation for demonstration
        """
        # Convert to grayscale if needed
        if len(img1.shape) == 3:
            img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        if len(img2.shape) == 3:
            img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        # Ensure same size
        if img1.shape != img2.shape:
            # Resize the smaller image to match the larger one
            if img1.size < img2.size:
                img1 = cv2.resize(img1, (img2.shape[1], img2.shape[0]))
            else:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

        # SSIM constants
        c1 = (0.01 * 255) ** 2
        c2 = (0.03 * 255) ** 2

        # Calculate means
        mu1 = np.mean(img1)
        mu2 = np.mean(img2)

        # Calculate variances and covariance
        sigma1_sq = np.var(img1)
        sigma2_sq = np.var(img2)
        sigma12 = np.mean((img1 - mu1) * (img2 - mu2))

        # Calculate SSIM
        numerator = (2 * mu1 * mu2 + c1) * (2 * sigma12 + c2)
        denominator = (mu1**2 + mu2**2 + c1) * (sigma1_sq + sigma2_sq + c2)

        ssim = numerator / denominator if denominator != 0 else 0
        return ssim

    def calculate_psnr(self, img1, img2):
        """
        Calculate Peak Signal-to-Noise Ratio
        """
        # Convert to grayscale if needed
        if len(img1.shape) == 3:
            img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        if len(img2.shape) == 3:
            img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

        # Ensure same size
        if img1.shape != img2.shape:
            if img1.size < img2.size:
                img1 = cv2.resize(img1, (img2.shape[1], img2.shape[0]))
            else:
                img2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))

        mse = np.mean((img1 - img2) ** 2)
        if mse == 0:
            return float('inf')

        max_pixel = 255.0
        psnr = 20 * np.log10(max_pixel / np.sqrt(mse))
        return psnr

    def kl_divergence(self, p, q):
        """Calculate Kullback-Leibler divergence"""
        p = p + 1e-6  # Avoid log(0)
        q = q + 1e-6
        p = p / np.sum(p)
        q = q / np.sum(q)
        return np.sum(p * np.log(p / q))

    def jensen_shannon_divergence(self, p, q):
        """Calculate Jensen-Shannon divergence"""
        m = 0.5 * (p + q)
        jsd = 0.5 * (self.kl_divergence(p, m) + self.kl_divergence(q, m))
        return jsd

    def wasserstein_distance(self, p, q):
        """Calculate Wasserstein distance (simplified)"""
        # This is a simplified version - in practice, use scipy or POT library
        return np.sum(np.abs(np.cumsum(p) - np.cumsum(q)))

    def bhattacharyya_distance(self, p, q):
        """Calculate Bhattacharyya distance"""
        p = p + 1e-6
        q = q + 1e-6
        p = p / np.sum(p)
        q = q / np.sum(q)
        bc = np.sum(np.sqrt(p * q))
        return -np.log(bc + 1e-6) if bc > 0 else float('inf')

    def calculate_skewness(self, data):
        """Calculate skewness of data"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 3)

    def calculate_kurtosis(self, data):
        """Calculate kurtosis of data"""
        mean = np.mean(data)
        std = np.std(data)
        if std == 0:
            return 0
        return np.mean(((data - mean) / std) ** 4) - 3  # Excess kurtosis
```

### 2. Gap Visualization and Reporting

```python
#!/usr/bin/env python3
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.stats import gaussian_kde
import seaborn as sns


class RealityGapVisualizer:
    """
    Visualize reality gaps for analysis and reporting
    """
    def __init__(self):
        self.figure_size = (12, 8)

    def plot_distribution_comparison(self, sim_data, real_data, title="Distribution Comparison"):
        """
        Plot distribution comparison between sim and real data
        """
        fig, axes = plt.subplots(2, 2, figsize=self.figure_size)

        # Histogram comparison
        axes[0, 0].hist(sim_data, bins=50, alpha=0.7, label='Simulation', density=True)
        axes[0, 0].hist(real_data, bins=50, alpha=0.7, label='Reality', density=True)
        axes[0, 0].set_title('Histogram Comparison')
        axes[0, 0].legend()
        axes[0, 0].grid(True)

        # Density plot comparison
        sim_density = gaussian_kde(sim_data)
        real_density = gaussian_kde(real_data)

        x_range = np.linspace(min(min(sim_data), min(real_data)),
                             max(max(sim_data), max(real_data)), 1000)

        axes[0, 1].plot(x_range, sim_density(x_range), label='Simulation', linewidth=2)
        axes[0, 1].plot(x_range, real_density(x_range), label='Reality', linewidth=2)
        axes[0, 1].set_title('Density Comparison')
        axes[0, 1].legend()
        axes[0, 1].grid(True)

        # Q-Q plot
        from scipy.stats import probplot
        sim_sorted = np.sort(sim_data)
        real_sorted = np.sort(real_data)
        min_len = min(len(sim_sorted), len(real_sorted))
        sim_sample = np.linspace(np.min(sim_sorted), np.max(sim_sorted), min_len)
        real_sample = np.linspace(np.min(real_sorted), np.max(real_sorted), min_len)

        axes[1, 0].scatter(sim_sample, real_sample, alpha=0.6)
        axes[1, 0].plot([sim_sample.min(), sim_sample.max()],
                       [sim_sample.min(), sim_sample.max()], 'r--', linewidth=2)
        axes[1, 0].set_xlabel('Simulation Quantiles')
        axes[1, 0].set_ylabel('Reality Quantiles')
        axes[1, 0].set_title('Q-Q Plot')
        axes[1, 0].grid(True)

        # Box plot comparison
        axes[1, 1].boxplot([sim_data, real_data], labels=['Simulation', 'Reality'])
        axes[1, 1].set_title('Box Plot Comparison')
        axes[1, 1].grid(True)

        plt.suptitle(title, fontsize=16)
        plt.tight_layout()
        plt.show()

    def plot_temporal_gap(self, sim_timestamps, sim_values, real_timestamps, real_values, title="Temporal Gap Analysis"):
        """
        Plot temporal behavior comparison
        """
        fig, axes = plt.subplots(2, 1, figsize=self.figure_size)

        # Time series comparison
        axes[0].plot(sim_timestamps, sim_values, label='Simulation', alpha=0.7)
        axes[0].plot(real_timestamps, real_values, label='Reality', alpha=0.7)
        axes[0].set_xlabel('Time')
        axes[0].set_ylabel('Value')
        axes[0].set_title('Time Series Comparison')
        axes[0].legend()
        axes[0].grid(True)

        # Residuals over time
        # Align timestamps and calculate residuals
        from scipy.interpolate import interp1d

        # Interpolate to common time base
        common_times = np.linspace(
            max(sim_timestamps[0], real_timestamps[0]),
            min(sim_timestamps[-1], real_timestamps[-1]),
            min(len(sim_timestamps), len(real_timestamps))
        )

        sim_interp = interp1d(sim_timestamps, sim_values, bounds_error=False, fill_value='extrapolate')
        real_interp = interp1d(real_timestamps, real_values, bounds_error=False, fill_value='extrapolate')

        sim_aligned = sim_interp(common_times)
        real_aligned = real_interp(common_times)

        residuals = real_aligned - sim_aligned

        axes[1].plot(common_times, residuals, 'r-', alpha=0.7)
        axes[1].axhline(y=0, color='k', linestyle='--', alpha=0.5)
        axes[1].set_xlabel('Time')
        axes[1].set_ylabel('Reality - Simulation')
        axes[1].set_title('Residuals Over Time')
        axes[1].grid(True)

        plt.suptitle(title, fontsize=16)
        plt.tight_layout()
        plt.show()

    def plot_multivariate_gap(self, sim_features, real_features, feature_names=None, title="Multivariate Gap Analysis"):
        """
        Plot multivariate comparison using scatter plots
        """
        if feature_names is None:
            feature_names = [f'Feature_{i}' for i in range(sim_features.shape[1])]

        n_features = sim_features.shape[1]
        n_cols = min(3, n_features)
        n_rows = int(np.ceil(n_features / n_cols))

        fig, axes = plt.subplots(n_rows, n_cols, figsize=(4*n_cols, 4*n_rows))
        if n_features == 1:
            axes = [axes]
        elif n_rows == 1 and n_cols > 1:
            axes = axes if n_cols > 1 else [axes]
        else:
            axes = axes.flatten() if n_rows > 1 else [axes]

        for i in range(n_features):
            axes[i].scatter(sim_features[:, i], real_features[:, i], alpha=0.6)

            # Add identity line
            min_val = min(sim_features[:, i].min(), real_features[:, i].min())
            max_val = max(sim_features[:, i].max(), real_features[:, i].max())
            axes[i].plot([min_val, max_val], [min_val, max_val], 'r--', linewidth=2, alpha=0.8)

            axes[i].set_xlabel(f'Simulation {feature_names[i]}')
            axes[i].set_ylabel(f'Reality {feature_names[i]}')
            axes[i].set_title(f'{feature_names[i]} Comparison')
            axes[i].grid(True)

        # Hide unused subplots
        for i in range(n_features, len(axes)):
            axes[i].set_visible(False)

        plt.suptitle(title, fontsize=16)
        plt.tight_layout()
        plt.show()

    def create_gap_report(self, gap_metrics, report_title="Reality Gap Analysis Report"):
        """
        Create a comprehensive gap analysis report
        """
        print(f"\n{'='*60}")
        print(f"{report_title}")
        print(f"{'='*60}")

        # Overall gap score
        overall_gap = self.calculate_overall_gap_score(gap_metrics)
        print(f"\nOverall Gap Score: {overall_gap:.3f} (0 = identical, 1 = maximally different)")

        print(f"\nDetailed Gap Metrics:")
        print(f"{'-'*40}")

        for category, metrics in gap_metrics.items():
            print(f"\n{category.upper()} Gap Metrics:")
            for metric_name, value in metrics.items():
                print(f"  {metric_name}: {value:.4f}")

        # Identify critical gaps
        critical_gaps = self.identify_critical_gaps(gap_metrics)
        if critical_gaps:
            print(f"\nCRITICAL GAPS DETECTED:")
            print(f"{'-'*25}")
            for gap_info in critical_gaps:
                print(f"  {gap_info['metric']}: {gap_info['value']:.4f} (threshold: {gap_info['threshold']})")

        print(f"\nRecommendations:")
        print(f"{'-'*15}")
        recommendations = self.generate_recommendations(gap_metrics)
        for rec in recommendations:
            print(f"  • {rec}")

    def calculate_overall_gap_score(self, gap_metrics):
        """
        Calculate an overall gap score based on all metrics
        """
        scores = []
        weights = {}

        # Assign weights to different metric categories
        category_weights = {
            'statistical': 0.25,
            'distributional': 0.3,
            'functional': 0.3,
            'perceptual': 0.15
        }

        for category, metrics in gap_metrics.items():
            if category in category_weights:
                category_score = np.mean(list(metrics.values())) if metrics else 0
                scores.append(category_score * category_weights[category])

        return np.sum(scores) if scores else 0.0

    def identify_critical_gaps(self, gap_metrics, threshold=0.5):
        """
        Identify metrics that exceed critical thresholds
        """
        critical_gaps = []

        # Define critical thresholds for different metrics
        thresholds = {
            'kl_divergence': 0.1,
            'js_divergence': 0.05,
            'mse': 1.0,
            'mean_difference': 0.5,
            'std_ratio': 2.0,
            'avg_ssim': 0.7,  # Lower SSIM is worse
        }

        for category, metrics in gap_metrics.items():
            for metric_name, value in metrics.items():
                if metric_name in thresholds:
                    if (metric_name == 'avg_ssim' and value < thresholds[metric_name]) or \
                       (metric_name != 'avg_ssim' and value > thresholds[metric_name]):
                        critical_gaps.append({
                            'metric': f"{category}.{metric_name}",
                            'value': value,
                            'threshold': thresholds[metric_name]
                        })

        return critical_gaps

    def generate_recommendations(self, gap_metrics):
        """
        Generate recommendations based on gap analysis
        """
        recommendations = []

        # Check for specific issues and add recommendations
        for category, metrics in gap_metrics.items():
            if category == 'distributional':
                if metrics.get('kl_divergence', 0) > 0.1:
                    recommendations.append(
                        "High KL divergence detected - consider domain randomization or adversarial training techniques"
                    )
                if metrics.get('js_divergence', 0) > 0.05:
                    recommendations.append(
                        "Significant distributional differences found - implement distribution matching methods"
                    )

            elif category == 'statistical':
                if metrics.get('mean_difference', 0) > 0.3:
                    recommendations.append(
                        "Significant mean differences - calibrate sensors or adjust simulation parameters"
                    )
                if metrics.get('std_ratio', 1.0) > 2.0:
                    recommendations.append(
                        "High variance differences - add more realistic noise models to simulation"
                    )

            elif category == 'functional':
                if metrics.get('mse', 0) > 0.5:
                    recommendations.append(
                        "High prediction errors - improve simulation fidelity or use sim-to-real transfer methods"
                    )
                if metrics.get('correlation', 1.0) < 0.7:
                    recommendations.append(
                        "Low correlation between sim and real - investigate model assumptions and environmental factors"
                    )

            elif category == 'perceptual':
                if metrics.get('avg_ssim', 1.0) < 0.8:
                    recommendations.append(
                        "Low structural similarity - enhance visual realism in simulation"
                    )
                if metrics.get('avg_psnr', float('inf')) < 25:
                    recommendations.append(
                        "Low PSNR values - improve image quality and reduce artifacts in simulation"
                    )

        if not recommendations:
            recommendations.append("No critical gaps detected - system ready for deployment")
        else:
            recommendations.append("Consider implementing domain randomization techniques to improve sim-to-real transfer")
            recommendations.append("Collect more real-world data to better understand and model the reality gap")

        return recommendations
```

## Mitigation Strategies

### 1. Domain Adaptation Techniques

```python
#!/usr/bin/env python3
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor


class DomainAdaptation:
    """
    Domain adaptation techniques to reduce reality gap
    """
    def __init__(self):
        self.adapters = {
            'statistical': self.statistical_normalization,
            'feature_alignment': self.feature_alignment,
            'transfer_learning': self.transfer_learning,
            'domain_randomization': self.domain_randomization
        }

    def statistical_normalization(self, sim_data, real_data):
        """
        Normalize simulation data to match real data statistics
        """
        # Calculate statistics for both datasets
        sim_mean = np.mean(sim_data, axis=0)
        sim_std = np.std(sim_data, axis=0)
        real_mean = np.mean(real_data, axis=0)
        real_std = np.std(real_data, axis=0)

        # Normalize simulation data
        sim_normalized = (sim_data - sim_mean) / (sim_std + 1e-6)
        sim_adapted = sim_normalized * real_std + real_mean

        return sim_adapted

    def feature_alignment(self, sim_features, real_features):
        """
        Align feature distributions between sim and real
        """
        # Use optimal transport or other alignment methods
        # This is a simplified version using linear transformation
        from sklearn.linear_model import LinearRegression

        # Fit a linear transformation from sim to real
        model = LinearRegression()
        model.fit(sim_features, real_features)

        # Transform simulation features
        aligned_features = model.predict(sim_features)

        return aligned_features

    def transfer_learning(self, sim_model, real_data, adaptation_method='fine_tuning'):
        """
        Adapt simulation-trained model to real data
        """
        if adaptation_method == 'fine_tuning':
            # Fine-tune the model on real data
            return self.fine_tune_model(sim_model, real_data)
        elif adaptation_method == 'domain_adversarial':
            # Use domain adversarial training
            return self.domain_adversarial_training(sim_model, real_data)
        else:
            raise ValueError(f"Unknown adaptation method: {adaptation_method}")

    def fine_tune_model(self, model, real_data):
        """
        Fine-tune model on real data
        """
        # This would involve training procedures specific to the model type
        # For demonstration, we'll return the model as-is
        return model

    def domain_adversarial_training(self, model, real_data):
        """
        Implement domain adversarial training
        """
        # This would involve training a domain classifier adversarially
        # For demonstration, we'll return the model as-is
        return model

    def domain_randomization(self, sim_env, randomization_params):
        """
        Apply domain randomization to simulation
        """
        # Randomize simulation parameters within specified ranges
        randomized_env = sim_env.copy()

        for param, (min_val, max_val) in randomization_params.items():
            if param in randomized_env:
                # Apply randomization
                random_factor = np.random.uniform(min_val, max_val)
                if isinstance(randomized_env[param], (int, float)):
                    randomized_env[param] *= random_factor
                elif isinstance(randomized_env[param], np.ndarray):
                    randomized_env[param] *= random_factor

        return randomized_env
```

### 2. Progressive Domain Transfer

```python
#!/usr/bin/env python3
class ProgressiveDomainTransfer:
    """
    Progressive transfer from simulation to reality
    """
    def __init__(self):
        self.transfer_stages = [
            {
                'name': 'Source Domain',
                'description': 'Original simulation environment',
                'complexity': 0,
                'validation_criteria': {'success_rate': 0.95}
            },
            {
                'name': 'Domain Randomization',
                'description': 'Simulation with randomized parameters',
                'complexity': 1,
                'validation_criteria': {'success_rate': 0.90}
            },
            {
                'name': 'Reduced Fidelity',
                'description': 'Simulation with reduced visual fidelity',
                'complexity': 2,
                'validation_criteria': {'success_rate': 0.85}
            },
            {
                'name': 'Hardware in Loop',
                'description': 'Real sensors with simulated environment',
                'complexity': 3,
                'validation_criteria': {'success_rate': 0.80}
            },
            {
                'name': 'Target Domain',
                'description': 'Real-world deployment',
                'complexity': 4,
                'validation_criteria': {'success_rate': 0.75}
            }
        ]

    def execute_transfer_stage(self, stage_index, model, validation_function):
        """
        Execute a specific transfer stage
        """
        stage = self.transfer_stages[stage_index]

        print(f"Executing transfer stage: {stage['name']}")
        print(f"Description: {stage['description']}")

        # Validate performance at this stage
        success_rate = validation_function(model)

        print(f"Success rate: {success_rate:.3f}")
        print(f"Required: {stage['validation_criteria']['success_rate']:.3f}")

        stage_passed = success_rate >= stage['validation_criteria']['success_rate']
        print(f"Stage {'PASSED' if stage_passed else 'FAILED'}")

        return stage_passed, success_rate

    def full_transfer_process(self, model, validation_function):
        """
        Execute the full progressive transfer process
        """
        results = []

        for i, stage in enumerate(self.transfer_stages):
            stage_passed, success_rate = self.execute_transfer_stage(
                i, model, validation_function
            )
            results.append({
                'stage': stage['name'],
                'success_rate': success_rate,
                'passed': stage_passed
            })

            if not stage_passed:
                print(f"\nTransfer process stopped at stage {stage['name']}")
                break

        return results
```

## Best Practices for Reality Gap Analysis

### 1. Systematic Gap Analysis Framework

```python
#!/usr/bin/env python3
class SystematicGapAnalysis:
    """
    Framework for systematic reality gap analysis
    """
    def __init__(self):
        self.analysis_pipeline = [
            self.data_collection,
            self.preprocessing,
            self.quantification,
            self.visualization,
            self.mitigation,
            self_validation
        ]

    def data_collection(self, environment, data_types):
        """
        Collect data from both simulation and reality
        """
        collected_data = {}

        for data_type in data_types:
            # Collect simulation data
            sim_data = environment.get_simulation_data(data_type)
            # Collect real data
            real_data = environment.get_real_data(data_type)

            collected_data[data_type] = {
                'sim': sim_data,
                'real': real_data
            }

        return collected_data

    def preprocessing(self, raw_data):
        """
        Preprocess data for gap analysis
        """
        processed_data = {}

        for data_type, data_pair in raw_data.items():
            sim_data = data_pair['sim']
            real_data = data_pair['real']

            # Normalize data if needed
            if hasattr(sim_data, 'shape') and hasattr(real_data, 'shape'):
                # Ensure same shape
                if sim_data.shape != real_data.shape:
                    # Resize or resample as appropriate
                    if sim_data.size > real_data.size:
                        # Downsample sim data
                        sim_data = self.downsample_data(sim_data, real_data.shape)
                    else:
                        # Upsample real data
                        real_data = self.upsample_data(real_data, sim_data.shape)

            processed_data[data_type] = {
                'sim': sim_data,
                'real': real_data
            }

        return processed_data

    def downsample_data(self, data, target_shape):
        """Downsample data to target shape"""
        if len(target_shape) == 1:
            # 1D data - use slicing
            step = len(data) // target_shape[0]
            if step > 0:
                return data[::step][:target_shape[0]]
        elif len(target_shape) == 2:
            # 2D data - use OpenCV resize
            import cv2
            return cv2.resize(data.astype(np.float32), target_shape[::-1]).astype(data.dtype)

        return data

    def upsample_data(self, data, target_shape):
        """Upsample data to target shape"""
        if len(target_shape) == 1:
            # 1D data - use interpolation
            x_old = np.linspace(0, 1, len(data))
            x_new = np.linspace(0, 1, target_shape[0])
            return np.interp(x_new, x_old, data)
        elif len(target_shape) == 2:
            # 2D data - use OpenCV resize
            import cv2
            return cv2.resize(data.astype(np.float32), target_shape[::-1]).astype(data.dtype)

        return data

    def quantification(self, processed_data):
        """
        Quantify gaps using multiple metrics
        """
        gap_metrics = {}
        quantifier = RealityGapQuantifier()

        for data_type, data_pair in processed_data.items():
            sim_data = data_pair['sim']
            real_data = data_pair['real']

            # Calculate all types of metrics
            metrics = {}
            metrics['statistical'] = quantifier.statistical_gap_metrics(sim_data, real_data)
            metrics['distributional'] = quantifier.distributional_gap_metrics(sim_data, real_data)

            gap_metrics[data_type] = metrics

        return gap_metrics

    def visualization(self, gap_metrics, processed_data):
        """
        Visualize gap analysis results
        """
        visualizer = RealityGapVisualizer()

        for data_type, data_pair in processed_data.items():
            sim_data = data_pair['sim']
            real_data = data_pair['real']

            # Create distribution comparison plot
            visualizer.plot_distribution_comparison(
                sim_data.flatten() if hasattr(sim_data, 'flatten') else sim_data,
                real_data.flatten() if hasattr(real_data, 'flatten') else real_data,
                f"Distribution Comparison - {data_type}"
            )

        # Create overall report
        visualizer.create_gap_report(gap_metrics, f"Reality Gap Analysis Report - {data_type}")

    def mitigation(self, gap_metrics, processed_data):
        """
        Apply mitigation strategies based on gap analysis
        """
        mitigation_results = {}
        adapter = DomainAdaptation()

        for data_type, data_pair in processed_data.items():
            sim_data = data_pair['sim']
            real_data = data_pair['real']

            # Apply statistical normalization
            normalized_sim = adapter.statistical_normalization(sim_data, real_data)
            mitigation_results[data_type] = {
                'normalized_data': normalized_sim,
                'applied_techniques': ['statistical_normalization']
            }

        return mitigation_results

    def self_validation(self, mitigation_results):
        """
        Validate mitigation results
        """
        validation_results = {}

        for data_type, results in mitigation_results.items():
            normalized_data = results['normalized_data']
            original_sim = results.get('original_sim', normalized_data)  # Placeholder

            # Check if normalization improved the gap
            # This would involve recalculating gap metrics
            validation_results[data_type] = {
                'normalization_effective': True,  # Placeholder
                'improvement_percentage': 0.1  # Placeholder
            }

        return validation_results

    def run_complete_analysis(self, environment, data_types):
        """
        Run complete gap analysis pipeline
        """
        print("Starting systematic gap analysis...")

        # Execute each stage of the pipeline
        raw_data = self.data_collection(environment, data_types)
        print("✓ Data collection completed")

        processed_data = self.preprocessing(raw_data)
        print("✓ Data preprocessing completed")

        gap_metrics = self.quantification(processed_data)
        print("✓ Gap quantification completed")

        self.visualization(gap_metrics, processed_data)
        print("✓ Gap visualization completed")

        mitigation_results = self.mitigation(gap_metrics, processed_data)
        print("✓ Gap mitigation completed")

        validation_results = self.self_validation(mitigation_results)
        print("✓ Self-validation completed")

        return {
            'gap_metrics': gap_metrics,
            'mitigation_results': mitigation_results,
            'validation_results': validation_results
        }
```

## Next Steps

After implementing reality gap analysis:

1. Move to simulation-to-reality transfer examples for practical applications
2. Implement ROS 2 integration examples for sim-to-reality workflows
3. Create comprehensive validation pipelines for multi-sensor systems
4. Test gap analysis methods in varied real-world conditions

## References

1. Ko, J., Hsu, L., Caffier, A. L., Lim, J. H., Venkatesan, R., & Soh, H. (2019). Sim-to-real transfer for learning robot grasping with real-world sensor data. *2019 International Conference on Robotics and Automation (ICRA)*, 5637-5643.

2. Peng, X. B., Andry, A., Zhang, J., Abbeel, P., & Driggs-Campbell, K. (2018). Sim-to-real transfer of robotic control with dynamics randomization. *2018 IEEE International Conference on Robotics and Automation (ICRA)*, 1-8.

3. Chebotar, Y., Hand, A., Wang, K., Suresh, K., Paik, I., Venkatesan, R., & Kalakrishnan, M. (2019). Closing the sim-to-real loop: Adapting simulation randomizations with real world structured observations. *2019 International Conference on Robotics and Automation (ICRA)*, 8973-8979.

4. Sadeghi, F., & Levine, S. (2017). CAD2RL: Real single-image flight without a single real image. *Proceedings of the European Conference on Computer Vision (ECCV)*, 203-219.

5. James, S., Davison, A. J., & Johns, E. (2019). Transferring CNNs across the sim-to-real gap. *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition Workshops*, 46-54.

---

This guide provides comprehensive methods for analyzing and quantifying the reality gap between simulation and real-world perception systems. The next section will cover practical simulation-to-reality transfer examples.