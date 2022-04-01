import numpy as np


class QuantumState:
    def __init__(self, vector):
        len = np.linalg.norm(vector)
        if not abs(1 - len) < 0.00001:
            raise ValueError("Quantum states must be unit length.")
        self.vector = np.array(vector)
        
