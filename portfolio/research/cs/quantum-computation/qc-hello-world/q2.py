import os, sys, time
import numpy as np

# utils
def underline(m=''):
    if m == '': print('\n No message passed.'); return
    print(m)
    for i in range(len(m)):
        if i==0: sys.stdout.write(' ' if m[i]==' ' else '-')
        else: sys.stdout.write('-\n'if i==len(m)-1 else '-')

def clear(m=''):
    os.system('clear' if os.name=='posix' else 'cls'); print(m)

def greet():
    clear('')
    underline(f' Welcome to QML')

# instantiate qbits
qb0 = np.array([[1],[0]])
qb1 = np.array([[1],[0]])

# instantiate gates
xgate = np.array([[0,1],[1,0]])
hgate = np.array([[1,1],[1,-1]])/np.sqrt(2)
cnotgate = np.eye(4)
cnotgate[2:,2:] = xgate

# superimpose qb state
qb0 = np.dot(hgate, qb0)
qb1 = np.dot(xgate, qb0)
qb01 = np.kron(qb0, qb1)
np.dot(cnotgate, qb01)


# runtime
if __name__ == "__main__":
    greet()
    print(f'\n qb0: \n{qb0}')
    print(f'\n qb1: \n{qb1}')
    print(f'\n qb0|qb1 superposition: \n{qb01}')
