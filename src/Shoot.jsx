import * as THREE from "three";
import { RigidBody } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect } from "react";
import { Trail } from "@react-three/drei";
import { useGame } from "ecctrl";

const Shoot = ({ player }) => {
    const { action1 } = useGame();
    const [cold, setCold] = useState(true);
    const [cubeMesh, setCubeMesh] = useState([]);
    const cubeRef = useRef();

    const position = useMemo(() => new THREE.Vector3(), []);
    const direction = useMemo(() => new THREE.Vector3(), []);

    const shoot = () => {        
        if (document.pointerLockElement) {
            if (cold) {
                setCold(false);
                setTimeout(() => {
                    setCold(true);
                }, 1000);
            } else {
                return;
            }

            const camPos = player.current.getWorldPosition(position);
            const camQuat = player.current.getWorldQuaternion(new THREE.Quaternion());
            
            const d = 2;
            const v = new THREE.Vector3(0.1, 0, 0.1);
            v.applyQuaternion(camQuat);
            v.multiplyScalar(d);
            position.copy(camPos).add(v);
    
            const newMesh = (
                <mesh
                    position={[position.x, position.y, position.z]}
                    scale={0.5}
                    castShadow
                    receiveShadow
                >
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color={0xaaaaff} />
                </mesh>
            );
            setCubeMesh((prevMeshes) => [...prevMeshes, newMesh]);

            action1();

            const audio = new Audio("/audios/shoot.mp3");
            audio.volume = 0.1;
            audio.play();
        }
    };

    useEffect(() => {
        player.current.getWorldDirection(direction);
        if (cubeMesh.length > 0) {
            cubeRef.current?.setLinvel(
                new THREE.Vector3(
                    direction.x * 50,
                    direction.y * 50,
                    direction.z * 50
                ),
                false
            );
        }
    }, [cubeMesh]);

    useEffect(() => {
        window.addEventListener("click", () => shoot());

        return () => {
            window.addEventListener("click", () => shoot());
        };
    }, []);

    return (
        <>
            {cubeMesh.map((item, i) => (
                <RigidBody key={i} colliders="ball" gravityScale={0} ref={cubeRef}>
                    {item}
                </RigidBody>
            ))}
        </>
    );
}

export default Shoot;
