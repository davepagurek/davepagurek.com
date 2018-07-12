#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt

data = np.genfromtxt('timing.csv', delimiter=',')

plt.figure(1)
tree_handles, = plt.plot(
    data[:, 0],
    data[:, 1],
    '--ro',
    label='$k$-d tree'
)
no_tree_handles, = plt.plot(
    data[:, 0],
    data[:, 2],
    '--bo',
    label='No tree'
)
plt.xlabel('Triangles')
plt.ylabel('Time (s)')
plt.xticks(data[:, 0])
plt.title("Rendering Time with Spacial Acceleration")
plt.legend(handles=[tree_handles, no_tree_handles])
plt.savefig("spacial_acceleration", bbox_inches='tight')
